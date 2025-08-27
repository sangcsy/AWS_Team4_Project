import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 이미지 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/images';
    
    // 업로드 디렉토리가 없으면 생성
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 파일명 중복 방지를 위해 타임스탬프 추가
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

// 파일 필터링
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 이미지 파일만 허용
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
};

// multer 인스턴스 생성
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

export class UploadController {
  // 이미지 업로드
  uploadImage = async (req: Request, res: Response) => {
    try {
      // multer 미들웨어 실행
      upload.single('image')(req, res, async (err) => {
        if (err) {
          console.error('이미지 업로드 에러:', err);
          return res.status(400).json({
            success: false,
            error: err.message || '이미지 업로드에 실패했습니다.'
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: '업로드할 이미지가 없습니다.'
          });
        }

        // 파일 정보
        const file = req.file;
        const imageUrl = `/uploads/images/${file.filename}`;

        console.log('✅ 이미지 업로드 성공:', {
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          url: imageUrl
        });

        res.json({
          success: true,
          data: {
            imageUrl: imageUrl,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype
          }
        });
      });
    } catch (error) {
      console.error('이미지 업로드 컨트롤러 에러:', error);
      res.status(500).json({
        success: false,
        error: '이미지 업로드 중 오류가 발생했습니다.'
      });
    }
  };

  // 이미지 삭제
  deleteImage = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join('uploads/images', filename);

      // 파일이 존재하는지 확인
      if (fs.existsSync(filePath)) {
        // 파일 삭제
        fs.unlinkSync(filePath);
        console.log('✅ 이미지 삭제 성공:', filename);

        res.json({
          success: true,
          message: '이미지가 삭제되었습니다.'
        });
      } else {
        res.status(404).json({
          success: false,
          error: '파일을 찾을 수 없습니다.'
        });
      }
    } catch (error) {
      console.error('이미지 삭제 에러:', error);
      res.status(500).json({
        success: false,
        error: '이미지 삭제 중 오류가 발생했습니다.'
      });
    }
  };
}
