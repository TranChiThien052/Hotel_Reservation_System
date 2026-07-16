import jwt from 'jsonwebtoken';

export const authorize = async (req, res, allowedRoles, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decodedToken;

    if (allowedRoles && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    await next();
};