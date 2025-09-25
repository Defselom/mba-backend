import { Test, TestingModule } from '@nestjs/testing';
import { PartnerApplicationsService } from './partner-applications.service';

describe('PartnerApplicationsService', () => {
  let service: PartnerApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartnerApplicationsService],
    }).compile();

    service = module.get<PartnerApplicationsService>(PartnerApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
