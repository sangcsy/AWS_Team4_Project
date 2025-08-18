const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(userData) {
    // 이메일 중복 확인
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 닉네임 중복 확인
    const existingNickname = await this.userRepository.findByNickname(userData.nickname);
    if (existingNickname) {
      throw new Error('이미 존재하는 닉네임입니다.');
    }

    // 비밀번호 해시화
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // 사용자 생성
    const user = await this.userRepository.create({
      ...userData,
      password_hash: passwordHash
    });

    return this.toUserResponse(user);
  }

  async login(loginData) {
    // 사용자 찾기
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return this.toUserResponse(user);
  }

  async checkNickname(nickname) {
    const existingUser = await this.userRepository.findByNickname(nickname);
    return !existingUser; // 닉네임이 사용 가능하면 true
  }

  async getMyTemperature(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    return user.temperature;
  }

  async updateTemperature(userId, temperatureChange) {
    const user = await this.userRepository.updateTemperature(userId, temperatureChange);
    return this.toUserResponse(user);
  }

  async updateProfile(userId, updates) {
    // 닉네임 변경 시 중복 확인
    if (updates.nickname) {
      const existingUser = await this.userRepository.findByNickname(updates.nickname);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('이미 존재하는 닉네임입니다.');
      }
    }

    const user = await this.userRepository.update(userId, updates);
    return this.toUserResponse(user);
  }

  toUserResponse(user) {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      temperature: user.temperature,
      created_at: user.created_at
    };
  }
}

module.exports = { UserService };
