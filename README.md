# 🌌 SpectraSphere

**SpectraSphere** is a hackathon project built at Hack the North 2025. It transforms a handful of photos and a short trip description into a **five-panel, themed storyboard**. Each story feels like a mini comic flipbook, complete with captions and stylized visuals. You can view and share the generated story as an immersive AR experience.  

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/your-username/spectrasphere.git
cd spectrasphere
```

### 2. Install dependencies
Backend (Express):
```bash
cd backend
npm install
```

Frontend (React/Next.js/Vite depending on your setup):
```bash
cd frontend
npm install
```

### 3. Configure environment variables
Create a `.env` file in `backend/` with:

```env
COHERE_API_KEY=your_real_cohere_api_key_here
COHERE_MODEL=c4ai-aya-vision-32b

# Jsonbin configuration
JSONBIN_ID=68c663ff43b1c97be94262fa
JSONBIN_KEY=your_real_jsonbin_master_key_here

PORT=8787
```

### 4. Run the servers locally
Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Now open `http://localhost:3000` (or whatever port your frontend runs on).

---

## 💻 Running in Lenstudio

If you’d rather not set up locally, you can run the project in [Lenstudio](https://lenstudio.dev):

1. Go to Lenstudio and **import the GitHub repo**  
   - Click *New Project* → *Import from GitHub* → paste your repo URL.  

2. Once imported, you’ll have two terminals available:  
   - `backend/` for the Express server  
   - `frontend/` for the React app  

3. In the backend terminal, install dependencies and start dev mode:
```bash
cd backend
npm install
npm run dev
```

4. In the frontend terminal, install dependencies and run the app:
```bash
cd frontend
npm install
npm run dev
```

5. Configure environment variables in Lenstudio’s **Project Settings** → *Environment*.  
   Add the same keys you’d put in `.env` (COHERE_API_KEY, JSONBIN_ID, etc.).  

6. Lenstudio will give you **public preview URLs** for both servers.  
   Use the frontend’s preview URL to open the app in your browser.  

---

## 🚀 Usage

1. **Upload 4 photos** of your trip.  
2. **Enter a short trip blurb** (e.g. “A weekend at Hack the North coding and exploring Waterloo”).  
3. Hit **Generate** — Cohere’s model + our backend produce a 5-panel story JSON.  
4. Story JSON is published to a **stable public Jsonbin URL**:  
   ```
   https://api.jsonbin.io/v3/b/<JSONBIN_ID>/latest?meta=false
   ```
5. The frontend fetches this JSON and renders it as a flipbook in your chosen theme (Comic, Ghibli, Watercolor, Cyberpunk).

---

## 🛠️ Tech Stack

- **Frontend:** React + Tailwind (themed UI, dark/light modes, animations)  
- **Backend:** Node.js + Express + Multer (file uploads)  
- **AI Model:** Cohere Aya Vision (`c4ai-aya-vision-32b`)  
- **Storage:** Jsonbin (stable public JSON endpoint)  
- **Other Tools:** Lucide icons, custom premium-styled components  

---

## 📸 Example Themes

- Comic Book  
- Studio Ghibli  
- Watercolor Travel Journal  
- Cyberpunk Neon  

---