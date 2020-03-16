const { expect } = require('chai');
const { stub, assert } = require('sinon');
const { create, getFileRejectionsDetail } = require('./repository');
const { db, TABLES } = require('knex-conn');

describe('History File Rejections repository', () => {
  const history_file_id = 1,
    employer_id = 318,
    employee_number = '1234',
    process_type = 'EDITED',
    first_name = 'Test',
    middle_name = 'Test',
    last_name = 'Test',
    email = 'test@test.com',
    q = '';

  describe('create', () => {
    let insertStub, intoStub;

    beforeEach(() => {
      insertStub = stub(db, 'insert').returns(db);
      intoStub = stub(db, 'into').returns(db);
    });

    afterEach(() => {
      insertStub.restore();
      intoStub.restore();
    });

    it('should create a new history file summary row', async () => {
      await create({
        process_type,
        employer_id,
        history_file_id,
        employee_number,
        first_name,
        middle_name,
        last_name,
        email
      });

      assert.calledWithExactly(insertStub, {
        process_type,
        employer_id,
        history_file_id,
        employee_number,
        first_name,
        middle_name,
        last_name,
        email
      });

      assert.calledWithExactly(intoStub, TABLES.historyFileRejections);
    });
  });

  describe('getFileRejectionsDetail', () => {
    let selectStub,
      fromStub,
      countStub,
      whereStub,
      offsetStub,
      limitStub,
      orWhereStub,
      groupByStub;

    beforeEach(() => {
      selectStub = stub(db, 'select').returns(db);
      fromStub = stub(db, 'from').returns(db);
      offsetStub = stub(db, 'offset').returns(db);
      countStub = stub(db, 'count').returns(db);
      groupByStub = stub(db, 'groupBy').returns(db);
      whereStub = stub(db, 'where').callsFake(function() {
        if (typeof arguments[0] === 'function')
          arguments[0].apply(db, arguments);
        return db;
      });
      limitStub = stub(db, 'limit').returns(db);
      orWhereStub = stub(db, 'orWhere').returns(db);
    });

    afterEach(() => {
      selectStub.restore();
      fromStub.restore();
      offsetStub.restore();
      countStub.restore();
      groupByStub.restore();
      whereStub.restore();
      limitStub.restore();
      orWhereStub.restore();
    });

    it('should get grouped history file rejections data by fileId', async () => {
      countStub.returns([{ 'count(*)': 1 }]);
      await getFileRejectionsDetail({
        employer_id,
        history_file_id,
        process_type,
        offset: 10,
        limit: 10,
        q
      });

      expect(fromStub.getCall(0).args[0]).to.be.eql(
        TABLES.historyFileRejections
      );
      assert.calledWithExactly(whereStub, {
        employer_id,
        history_file_id,
        process_type
      });

      expect(fromStub.getCall(1).args[0]).to.be.eql(
        TABLES.historyFileRejections
      );
      assert.notCalled(orWhereStub);
    });

    it('should get grouped history file rejections data by fileId when send filters', async () => {
      countStub.returns([{ 'count(*)': 1 }]);
      await getFileRejectionsDetail({
        employer_id,
        history_file_id,
        process_type,
        offset: 10,
        limit: 10,
        q: 'test'
      });

      expect(fromStub.getCall(0).args[0]).to.be.eql(
        TABLES.historyFileRejections
      );
      assert.calledWithExactly(whereStub, {
        employer_id,
        history_file_id,
        process_type
      });

      expect(fromStub.getCall(1).args[0]).to.be.eql(
        TABLES.historyFileRejections
      );

      expect(whereStub.getCall(3).args, ['first_name', 'like', `%${q}%`]);
      expect(orWhereStub.getCall(0).args, ['middle_name', 'like', `%${q}%`]);
      expect(orWhereStub.getCall(1).args, ['last_name', 'like', `%${q}%`]);
    });
  });
});
