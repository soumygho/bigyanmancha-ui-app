import { ApiModule } from "../../api/api.module";

let importApiModule = [
  ApiModule.forRoot({rootUrl: 'http://localhost:8080'})
];

export default importApiModule;
