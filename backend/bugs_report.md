# Bug Report: Application Stability & Testing Issues

I have performed a comprehensive analysis of the codebase and identified several critical bugs preventing proper testing and deployment.

## 1. Test Environment Configuration (Fixed)
- **Issue**: The testing environment was completely unconfigured.
  - Missing `.env.test` file.
  - Missing `whaticket_test` database.
  - Test scripts (`npm test`) failed immediately.
- **Fix Applied**: 
  - Created `.env.test` with correct configuration (using `mysql` dialect).
  - Automated database creation/reset.

## 2. Migration Conflicts & Errors (Fixed)
- **Issue**: Database migrations were broken.
  - **Duplicate Migration**: `20260206130000-create-close-reasons` and `20260206200000-create-close-reasons` were trying to create the same table, causing duplicate key errors.
  - **Dialect Incompatibility**: `20200730153237-remove-user-association-from-messages` failed with `Cannot delete property 'meta'` due to `mariadb` dialect issues with Sequelize v5.
- **Fix Applied**:
  - Deleted conflicting `dist` migration file.
  - Switched dialect to `mysql` which is more stable for these migrations.

## 3. Test Utility Logic Bugs (Fixed/Need Refinement)
- **Issue**: The `truncate` utility used in tests fails to handle Foreign Key constraints properly.
  - Error: `Cannot truncate a table referenced in a foreign key constraint`.
  - Cause: Sequelize's `truncate` doesn't always handle FK disabling correctly across connection pools in MariaDB/MySQL.
  - **Attempted Fix**: Added `SET FOREIGN_KEY_CHECKS = 0` to truncate utility. However, connection pooling still makes this flaky for some test suites (`ListUserService`).

## 4. Dependency Mismatch & Runtime Errors
- **Issue**: `puppeteer-core` is trying to use `node:fs/promises`, but the Jest environment (Jest v26) is struggling to resolve it properly in some test suites (`DeleteUserService`).
- **Recommendations**: Upgrade Jest to v27+ or ensure Node environment is correctly polyfilled.

## 5. Database Seeding Idempotency
- **Issue**: `npm test` runs `db:seed:all` which fails if run twice on the same DB because seeds are not idempotent.
- **Workaround**: Tests must drop and recreate the database on every run.

## Next Steps
To have a fully bug-free application:
1.  **Upgrade Dependencies**: Project is using older Sequelize v5 and Jest v26. Upgrade to Sequelize v6 and Jest v29.
2.  **Fix Test Utils**: Implement robust database cleaning that handles foreign keys properly (using non-pooled transaction or forcing same connection).
3.  **Clean Build Artifacts**: Add a `clean` script (`rimraf dist`) to the build process.
