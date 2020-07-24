import '../shared/styles/global.scss';

import { requireAll } from '../shared/scripts/utils';

requireAll(require.context('./pages/', true, /\.ts$/));
