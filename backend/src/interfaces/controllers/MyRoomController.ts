const { MyRoomService } = require('../../application/myroom/MyRoomService');
const { MyRoomRepositoryImpl } = require('../../infrastructure/myroom/MyRoomRepositoryImpl');

class MyRoomController {
  constructor() {
    const myRoomRepository = new MyRoomRepositoryImpl();
    this.myRoomService = new MyRoomService(myRoomRepository);
  }

  createMyRoom = async (req, res) => {
    try {
      const { profile_image, bio } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const myroom = await this.myRoomService.createMyRoom(userId, { profile_image, bio });

      res.status(201).json({
        success: true,
        message: '마이룸이 생성되었습니다.',
        data: myroom
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  getMyRoom = async (req, res) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const myroom = await this.myRoomService.getMyRoom(userId);
      if (!myroom) {
        return res.status(404).json({
          success: false,
          error: '마이룸을 찾을 수 없습니다.'
        });
      }

      res.json({
        success: true,
        data: myroom
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  updateMyRoom = async (req, res) => {
    try {
      const { profile_image, bio } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const myroom = await this.myRoomService.updateMyRoom(userId, { profile_image, bio });

      res.json({
        success: true,
        message: '마이룸이 업데이트되었습니다.',
        data: myroom
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  deleteMyRoom = async (req, res) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      await this.myRoomService.deleteMyRoom(userId);

      res.json({
        success: true,
        message: '마이룸이 삭제되었습니다.'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  updateTemperature = async (req, res) => {
    try {
      const { temperature_change } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      if (temperature_change === undefined) {
        return res.status(400).json({
          success: false,
          error: '온도 변화값을 입력해주세요.'
        });
      }

      const myroom = await this.myRoomService.updateTemperature(userId, temperature_change);

      res.json({
        success: true,
        message: '온도가 업데이트되었습니다.',
        data: myroom
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  addItem = async (req, res) => {
    try {
      const { name, description, item_type, rarity } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      if (!name || !item_type || !rarity) {
        return res.status(400).json({
          success: false,
          error: '아이템 이름, 타입, 희귀도를 입력해주세요.'
        });
      }

      const item = await this.myRoomService.addItem(userId, {
        name,
        description,
        item_type,
        rarity,
        acquired_at: new Date()
      });

      res.status(201).json({
        success: true,
        message: '아이템이 추가되었습니다.',
        data: item
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  getItems = async (req, res) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const items = await this.myRoomService.getItems(userId);

      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  removeItem = async (req, res) => {
    try {
      const { itemId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      await this.myRoomService.removeItem(userId, itemId);

      res.json({
        success: true,
        message: '아이템이 제거되었습니다.'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };
}

module.exports = { MyRoomController };
