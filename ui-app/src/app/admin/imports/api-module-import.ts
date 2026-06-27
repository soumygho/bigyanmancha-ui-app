import { ApiModule } from '../../api/api.module';
import { environment } from '../../../environments/environment';

let importApiModule = [ApiModule.forRoot({ rootUrl: environment.apiBaseUrl })];

export default importApiModule;
