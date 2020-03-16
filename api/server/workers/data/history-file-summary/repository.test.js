const { expect } = require('chai');
const { stub, assert } = require('sinon');
const { create } = require('./repository');
const { db, TABLES } = require('knex-conn');

describe('History File Summary repository', () => {
  const history_file_id = 1,
    employer_id = 318,
    employee_number = '1234',
    process_type = 'EDITED',
    type = 'SUMMARY',
    evercheck_employee_id = 12,
    field_edited = 'First Name',
    process_error = null;

  describe('create', () => {
    let returningStub, insertStub, intoStub;

    beforeEach(() => {
      returningStub = stub(db, 'returning').returns(db);
      insertStub = stub(db, 'insert').returns(db);
      intoStub = stub(db, 'into').returns(db);
    });

    afterEach(() => {
      returningStub.restore();
      insertStub.restore();
      intoStub.restore();
    });

    it('should create a new history file summary row', async () => {
      await create({
        process_type,
        type,
        employer_id,
        employee_number,
        history_file_id,
        evercheck_employee_id,
        field_edited,
        process_error
      });

      assert.calledWithExactly(insertStub, {
        process_type,
        type,
        employer_id,
        employee_number,
        history_file_id,
        evercheck_employee_id,
        field_edited,
        process_error
      });

      assert.calledWithExactly(intoStub, TABLES.historyFileSummary);
    });

    it('return an error when history file summary exists', async () => {
      returningStub.throws({ code: 'ER_DUP_ENTRY' });
      const result = await create({
        process_type,
        type,
        employer_id,
        employee_number,
        history_file_id,
        evercheck_employee_id,
        field_edited,
        process_error
      });

      expect(result).to.be.undefined;
    });

    it('return an error when database fails', async () => {
      returningStub.throws(new Error('ERROR'));
      let isError = false;
      try {
        await create({
          process_type,
          type,
          employer_id,
          employee_number,
          history_file_id,
          evercheck_employee_id,
          field_edited,
          process_error
        });
      } catch (error) {
        isError = true;
      }
      expect(isError).to.be.true;
    });
  });
});
