import { Test, TestingModule } from '@nestjs/testing';
import { PartnerApplicationsController } from './partner-applications.controller';

describe('PartnerApplicationsController', () => {
  let controller: PartnerApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerApplicationsController],
    }).compile();

    controller = module.get<PartnerApplicationsController>(PartnerApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
