// SImple API route that returns a JSON message
export default async function handler(req, res) {
  res.status(200).json({ message: 'Hello World' });
}
