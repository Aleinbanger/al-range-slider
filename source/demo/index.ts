import { requireAll } from 'shared/scripts/utils/utils';
import 'shared/styles/global.scss';

requireAll(require.context('./pages/', true, /\.ts$/));
