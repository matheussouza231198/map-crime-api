import { accounts } from './accounts';
import { reports, reportsRelations, reportsTimelines, reportsTimelinesRelations } from './reports';
import { sessions } from './sessions';
import { users } from './users';
import { verifications } from './verifications';

export const schema = {
  users,
  accounts,
  sessions,
  verifications,
  reports,
  reportsTimelines,
  reportsRelations,
  reportsTimelinesRelations,
};
