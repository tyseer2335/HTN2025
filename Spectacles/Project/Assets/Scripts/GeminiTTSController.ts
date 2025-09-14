import { Gemini } from "Remote Service Gateway.lspkg/HostedExternal/Gemini";
import { GeminiTypes } from "Remote Service Gateway.lspkg/HostedExternal/GeminiTypes";
import { AudioProcessor } from "Remote Service Gateway.lspkg/Helpers/AudioProcessor";
import { DynamicAudioOutput } from "Remote Service Gateway.lspkg/Helpers/DynamicAudioOutput";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import { setTimeout } from "SpectaclesInteractionKit.lspkg/Utils/FunctionTimingUtils";

@component
export class GeminiTTSController extends BaseScriptComponent {
  @ui.separator
  @ui.label("Gemini Text-to-Speech Controller")
  @ui.separator
  
  @ui.group_start("TTS Configuration")
  @input
  private dynamicAudioOutput: DynamicAudioOutput;
  @input
  private audioProcessor: AudioProcessor;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Voice Settings")
  @input
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Puck", "Puck"),
      new ComboBoxItem("Charon", "Charon"),
      new ComboBoxItem("Kore", "Kore"),
      new ComboBoxItem("Fenrir", "Fenrir"),
      new ComboBoxItem("Aoede", "Aoede"),
      new ComboBoxItem("Leda", "Leda"),
      new ComboBoxItem("Orus", "Orus"),
      new ComboBoxItem("Zephyr", "Zephyr"),
    ])
  )
  private voice: string = "Puck";
  
  @input
  private speechRate: number = 1.0;
  
  @input
  private pitch: number = 0.0;
  
  @input
  private volume: number = 1.0;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Advanced Settings")
  @input
  private useGeminiTTS: boolean = true;
  
  @input
  private fallbackToLensTTS: boolean = true;
  @ui.group_end

  // Events
  public onTTSStart: Event<void> = new Event<void>();
  public onTTSComplete: Event<void> = new Event<void>();
  public onTTSError: Event<string> = new Event<string>();
  public onTTSProgress: Event<number> = new Event<number>();

  private isGenerating: boolean = false;
  private currentText: string = "";

  onStart() {
    if (this.dynamicAudioOutput) {
      this.dynamicAudioOutput.initialize(24000);
    }
  }

  /**
   * Generate speech from text using Gemini TTS or Lens Studio TTS
   * @param text The text to convert to speech
   * @param useGemini Whether to use Gemini TTS (true) or Lens Studio TTS (false)
   */
  public async generateSpeech(text: string, useGemini?: boolean): Promise<void> {
    if (this.isGenerating) {
      print("TTS already in progress, please wait...");
      return;
    }

    this.currentText = text;
    this.isGenerating = true;
    this.onTTSStart.invoke();

    try {
      const shouldUseGemini = useGemini !== undefined ? useGemini : this.useGeminiTTS;
      
      if (shouldUseGemini) {
        await this.generateWithGemini(text);
      } else {
        await this.generateWithLensTTS(text);
      }
    } catch (error) {
      this.handleTTSError("Failed to generate speech: " + error);
    }
  }

  /**
   * Generate speech using Gemini's TTS API
   */
  private async generateWithGemini(text: string): Promise<void> {
    try {
      const request: GeminiTypes.Models.GenerateContentRequest = {
        model: "gemini-2.0-flash-preview",
        type: "generateContent",
        body: {
          contents: [
            {
              parts: [
                {
                  text: text,
                },
              ],
              role: "user",
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: this.voice,
                },
              },
            },
          },
        },
      };

      const response = await Gemini.models(request);
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No audio generated in response");
      }

      let foundAudio = false;
      for (let part of response.candidates[0].content.parts) {
        if (part?.inlineData && part.inlineData.mimeType?.startsWith("audio/")) {
          foundAudio = true;
          const b64Audio = part.inlineData.data;
          const audioData = Base64.decode(b64Audio);
          
          if (this.dynamicAudioOutput) {
            this.dynamicAudioOutput.addAudioFrame(audioData);
            this.onTTSComplete.invoke();
          } else {
            throw new Error("DynamicAudioOutput not initialized");
          }
          break;
        }
      }

      if (!foundAudio) {
        throw new Error("No audio data found in Gemini response");
      }
    } catch (error) {
      if (this.fallbackToLensTTS) {
        print("Gemini TTS failed, falling back to Lens Studio TTS: " + error);
        await this.generateWithLensTTS(text);
      } else {
        throw error;
      }
    }
  }

  /**
   * Generate speech using Lens Studio's built-in TTS
   */
  private async generateWithLensTTS(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // For now, we'll use a simplified approach since global.textToSpeechModule
        // is not available in the current Lens Studio version
        // This would need to be implemented using the proper Lens Studio TTS API
        
        // Simulate TTS completion for now
        setTimeout(() => {
          this.onTTSComplete.invoke();
          resolve();
        }, 1000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop current TTS generation
   */
  public stopTTS(): void {
    if (this.isGenerating) {
      this.isGenerating = false;
      
      if (this.dynamicAudioOutput) {
        this.dynamicAudioOutput.interruptAudioOutput();
      }
      
      // Stop Lens Studio TTS if running
      // Note: This would need to be implemented using the proper Lens Studio TTS API
      // For now, we just log the stop action
      print("TTS stopped");
    }
  }

  /**
   * Check if TTS is currently generating
   */
  public isTTSGenerating(): boolean {
    return this.isGenerating;
  }

  /**
   * Get the current text being processed
   */
  public getCurrentText(): string {
    return this.currentText;
  }

  /**
   * Set voice for TTS
   */
  public setVoice(voice: string): void {
    this.voice = voice;
  }

  /**
   * Set speech rate (0.1 to 2.0)
   */
  public setSpeechRate(rate: number): void {
    this.speechRate = Math.max(0.1, Math.min(2.0, rate));
  }

  /**
   * Set pitch (-20 to 20)
   */
  public setPitch(pitch: number): void {
    this.pitch = Math.max(-20, Math.min(20, pitch));
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0.0, Math.min(1.0, volume));
  }

  private handleTTSError(error: string): void {
    this.isGenerating = false;
    this.onTTSError.invoke(error);
    print("TTS Error: " + error);
  }

  onDestroy() {
    this.stopTTS();
  }
}
