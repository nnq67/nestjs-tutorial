import { Test, TestingModule } from '@nestjs/testing';
import type { I18nContext } from 'nestjs-i18n';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const appServiceMock = {
    getHello: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appServiceMock,
        },
      ],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      appServiceMock.getHello.mockReturnValue('Hello World!');

      const i18nContext = {
        lang: 'en',
      } as I18nContext;

      const result = appController.getHello(i18nContext);

      expect(result).toBe('Hello World!');

      expect(appServiceMock.getHello).toHaveBeenCalledWith('en');

      expect(appServiceMock.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
