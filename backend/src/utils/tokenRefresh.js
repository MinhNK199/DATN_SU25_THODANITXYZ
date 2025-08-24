import jwt from 'jsonwebtoken';

// Kiểm tra token có sắp hết hạn không (trước 1 giờ)
export const isTokenExpiringSoon = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return false;
        
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = decoded.exp - now;
        const oneHour = 60 * 60; // 1 giờ
        
        return timeUntilExpiry < oneHour;
    } catch (error) {
        return false;
    }
};

// Tạo token mới
export const generateNewToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Middleware để kiểm tra và refresh token
export const checkAndRefreshToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return next();
        }

        // Kiểm tra token có sắp hết hạn không
        if (isTokenExpiringSoon(token)) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Tạo token mới
                const newToken = generateNewToken(decoded.id);
                
                // Thêm vào response header để frontend có thể cập nhật
                res.set('X-New-Token', newToken);
                res.set('X-Token-Refreshed', 'true');
                
                console.log('🔄 Token đã được refresh cho user:', decoded.id);
            } catch (error) {
                // Token đã hết hạn, không thể refresh
                console.log('❌ Không thể refresh token đã hết hạn');
            }
        }
        
        next();
    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra token:', error);
        next();
    }
};
