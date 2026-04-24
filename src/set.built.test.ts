import { createImportFnTests } from '@bemedev/dev-utils/build-tests';

describe(
  ...createImportFnTests({
    FAILS: [],
    SUCCESS: ['createBetterSet', 'createSet'],
  }),
);
