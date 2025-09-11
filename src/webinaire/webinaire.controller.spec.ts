import { Test, TestingModule } from '@nestjs/testing';
import { WebinaireController } from './webinar.controller';

describe('WebinaireController', () => {
  let controller: WebinaireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebinaireController],
    }).compile();

    controller = module.get<WebinaireController>(WebinaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
