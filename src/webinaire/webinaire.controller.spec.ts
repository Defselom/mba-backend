import { Test, TestingModule } from '@nestjs/testing';

import { WebinarController } from '@/webinaire/webinar.controller';

describe('WebinarController', () => {
  let controller: WebinarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebinarController],
    }).compile();

    controller = module.get<WebinarController>(WebinarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
