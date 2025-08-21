import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TEMPUS API',
      version: '1.0.0',
      description: 'TEMPUS 커뮤니티 백엔드 API 문서',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/interfaces/controllers/*.ts',
    './src/interfaces/routes/*.ts',
    './src/domain/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);