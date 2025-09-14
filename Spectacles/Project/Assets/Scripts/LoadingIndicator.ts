/**
 * This script fills a loading indicator to represent progress while a task is
 * completed.
 *
 * @version 1.0.0
 */
@component
export class LoadingIndicator extends BaseScriptComponent {
  @input
  private progressionSpeed: number = 0.3

  private material: Material
  private progress: number = 0
  private isValidMaterial: boolean = false

  /**
   * Allows custom start and stop functions to be added to the indicator.
   */
  public checkProgressing?: () => boolean

  onAwake() {
    try {
      // Get the RenderMeshVisual component with validation
      const renderMeshVisual = this.sceneObject.getComponent("Component.RenderMeshVisual")

      if (!renderMeshVisual) {
        print("LoadingIndicator: Error - No RenderMeshVisual component found on SceneObject")
        this.isValidMaterial = false
        return
      }

      this.material = renderMeshVisual.mainMaterial

      if (!this.material) {
        print("LoadingIndicator: Error - No mainMaterial found on RenderMeshVisual component")
        this.isValidMaterial = false
        return
      }

      // Check if the material has the required progress_value property
      if (!this.material.mainPass) {
        print("LoadingIndicator: Error - Material has no mainPass")
        this.isValidMaterial = false
        return
      }

      this.isValidMaterial = true
      print("LoadingIndicator: Material initialized successfully")
    } catch (error) {
      print("LoadingIndicator: Error initializing material: " + error)
      this.isValidMaterial = false
      return
    }

    this.createEvent("OnEnableEvent").bind(() => {
      this.progress = 0
    })

    this.createEvent("UpdateEvent").bind(() => {
      this.update()
    })
  }

  /**
   * Resets the progression to 0.
   */
  public reset(): void {
    this.progress = 0
  }

  private update(): void {
    // Only update if we have a valid material
    if (!this.isValidMaterial || !this.material || !this.material.mainPass) {
      return
    }

    try {
      if (!this.checkProgressing || this.checkProgressing()) {
        this.progress += getDeltaTime() * this.progressionSpeed
      } else {
        this.progress = 0.05
      }

      // Safely set the progress value
      this.material.mainPass.progress_value = Math.min(this.progress, 0.95)
    } catch (error) {
      print("LoadingIndicator: Error updating progress: " + error)
      this.isValidMaterial = false
    }
  }
}
