export default function handler(req, res) {
    console.log("API route executed");  // Add this line
    res.status(200).json({ message: "Hello from API" });
  }
  