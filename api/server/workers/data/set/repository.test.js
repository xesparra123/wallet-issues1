const { expect } = require('chai');
const { stub, assert } = require('sinon');
const { db, TABLES } = require('knex-conn');
const {
  findOrCreate,
  updateRequirements,
  updateStatus,
  inactivateSet,
  findById,
  findEmployeesPositionIds,
  updateOverrideStatus,
  countEmployeesByStatus,
  getEmployeesByStatus
} = require('./repository');
const daysjs = require('dayjs');

describe('Employee Position Set ', () => {
  const employee_position_id = 1,
    employer_id = 318,
    start_date = daysjs().format('YYYY-MM-DD HH:mm:ss'),
    requirements = [{ isTBO: true }],
    status = 'UNKNOWN',
    updated_at = daysjs().format('YYYY-MM-DD'),
    key = '{"DEPARTMENT NUMBER":["ABC"],"PROCESS LEVEL":["88888"]}';

  describe('findOrCreate', () => {
    let selectStub, fromStub, whereStub, returningStub, insertStub, intoStub;

    beforeEach(() => {
      selectStub = stub(db, 'select').returns(db);
      fromStub = stub(db, 'from').returns(db);
      whereStub = stub(db, 'where').returns(db);
      returningStub = stub(db, 'returning').returns(db);
      insertStub = stub(db, 'insert').returns(db);
      intoStub = stub(db, 'into').returns(db);
    });

    afterEach(() => {
      selectStub.restore();
      fromStub.restore();
      whereStub.restore();
      returningStub.restore();
      insertStub.restore();
      intoStub.restore();
    });

    it('should find the Employee position Set and return all information', async () => {
      intoStub.throws({ code: 'ER_DUP_ENTRY' });
      whereStub.returns([{ id: 1 }]);
      const result = await findOrCreate({
        employee_position_id,
        employer_id,
        start_date,
        key
      });

      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(whereStub, {
        employee_position_id,
        employer_id,
        key
      });
      expect(result).to.be.eql({ id: 1 });
    });

    it('should not find the Employee position Set and create a new', async () => {
      intoStub.returns([15]);
      const result = await findOrCreate({
        employee_position_id,
        employer_id,
        start_date,
        key
      });

      assert.calledWithExactly(insertStub, {
        employee_position_id,
        employer_id,
        start_date: null,
        key
      });

      assert.calledWithExactly(intoStub, TABLES.employeePositionSets);
      expect(result).to.be.eql({ id: 15 });
    });

    it('Should fails the query in database', async () => {
      let isFail = false;
      try {
        intoStub.throws(new Error('ERROR'));
        await findOrCreate({
          employee_position_id,
          employer_id,
          start_date,
          key
        });
      } catch (error) {
        isFail = true;
        expect(error.message).to.be.equal('ERROR');
      }
      expect(isFail).to.be.true;
    });
  });

  describe('updateRequirements', () => {
    let updateStub, fromStub, whereStub;

    beforeEach(() => {
      updateStub = stub(db, 'update').returns(db);
      fromStub = stub(db, 'from').returns(db);
      whereStub = stub(db, 'where').returns(db);
    });

    afterEach(() => {
      updateStub.restore();
      fromStub.restore();
      whereStub.restore();
    });

    it('should update requirements blob in employeepositionset table', async () => {
      await updateRequirements({
        id: 1,
        requirements
      });

      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(whereStub, {
        id: 1
      });
      assert.calledWithExactly(updateStub, {
        requirements: JSON.stringify(requirements),
        updated_at
      });
    });
  });

  describe('updateStatus', () => {
    let updateStub, fromStub, whereStub;

    beforeEach(() => {
      updateStub = stub(db, 'update').returns(db);
      fromStub = stub(db, 'from').returns(db);
      whereStub = stub(db, 'where').returns(db);
    });

    afterEach(() => {
      updateStub.restore();
      fromStub.restore();
      whereStub.restore();
    });

    it('should update status in employeepositionset table', async () => {
      await updateStatus({
        id: 1,
        status,
        id_imported_file: 2
      });

      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(whereStub, {
        id: 1
      });
      assert.calledWithExactly(updateStub, {
        status,
        prev_status: status,
        updated_at,
        id_imported_file: 2
      });
    });
  });

  describe('inactivateSet', () => {
    let updateStub, fromStub, whereStub, whereNotStub, orWhereNullStub;

    beforeEach(() => {
      updateStub = stub(db, 'update').returns(db);
      fromStub = stub(db, 'from').returns(db);
      whereStub = stub(db, 'where').returns(db);
      whereNotStub = stub(db, 'whereNot').returns(db);
      orWhereNullStub = stub(db, 'orWhereNull').returns(db);
    });

    afterEach(() => {
      updateStub.restore();
      fromStub.restore();
      whereStub.restore();
      whereNotStub.restore();
      orWhereNullStub.restore();
    });

    it('should update status to inactive in employeepositionset table', async () => {
      await inactivateSet({ employer_id, id_imported_file: 2 });

      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(whereStub, {
        employer_id
      });
      assert.calledWithExactly(whereNotStub, {
        status: 'inactive',
        id_imported_file: 2
      });
      assert.calledWithExactly(orWhereNullStub, 'id_imported_file');
      assert.calledWithExactly(updateStub, {
        status: 'inactive',
        updated_at: db.fn.now()
      });
    });
  });

  describe('findById', () => {
    let selectStub, fromStub, whereStub;
    beforeEach(() => {
      selectStub = stub(db, 'select').returns(db);
      fromStub = stub(db, 'from').returns(db);
      whereStub = stub(db, 'where').returns(db);
    });

    afterEach(() => {
      selectStub.restore();
      fromStub.restore();
      whereStub.restore();
    });

    it('should update status in employeepositionset table', async () => {
      await findById({
        id: 1,
        status
      });

      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(whereStub, {
        id: 1
      });
    });
  });

  describe('findEmployeesPositionIds', () => {
    let selectStub, fromStub, whereStub, orderByStub;
    beforeEach(() => {
      selectStub = stub(db, 'select').returns(db);
      fromStub = stub(db, 'from').returns(db);
      whereStub = stub(db, 'where').returns(db);
      orderByStub = stub(db, 'orderBy').returns(db);
    });

    afterEach(() => {
      selectStub.restore();
      fromStub.restore();
      whereStub.restore();
      orderByStub.restore();
    });

    it('should find ids in table', async () => {
      orderByStub.returns([{ employee_position_id: 1, status: 'inactive' }]);
      const result = await findEmployeesPositionIds({
        employer_id
      });

      assert.calledWithExactly(selectStub, ['employee_position_id', 'status']);
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(whereStub, {
        employer_id
      });
      assert.calledWithExactly(orderByStub, 'employee_position_id');
      expect(result).to.be.eql([
        { employee_position_id: 1, status: 'inactive' }
      ]);
    });
  });

  describe('updateOverrideStatus', () => {
    let updateStub, fromStub, whereStub;
    beforeEach(() => {
      updateStub = stub(db, 'update').returns(db);
      fromStub = stub(db, 'from').returns(db);
      whereStub = stub(db, 'where').returns(db);
    });

    afterEach(() => {
      updateStub.restore();
      fromStub.restore();
      whereStub.restore();
    });

    it('should find ids in table', async () => {
      whereStub.returns([{ id: 1 }]);
      const result = await updateOverrideStatus({
        employer_id,
        id: 1,
        override_status: true
      });

      assert.calledWithExactly(updateStub, { override_status: true });
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(whereStub, {
        employer_id,
        id: 1
      });
      expect(result).to.be.eql([{ id: 1 }]);
    });
  });

  describe('countEmployeesByStatus', () => {
    let countStub,
      fromStub,
      innerJoinStub,
      whereStub,
      offsetStub,
      limitStub,
      orWhereStub,
      andWhereStub,
      whereNotStub,
      whereInStub;

    const employer_id = 365,
      status = 'SATISFIED',
      q = '12345';
    const employee_numbers = [1, 2, 3, 4, 5];

    beforeEach(() => {
      countStub = stub(db, 'count').returns(db);
      fromStub = stub(db, 'from').returns(db);
      innerJoinStub = stub(db, 'innerJoin').returns(db);
      whereStub = stub(db, 'where')
        .returns(db)
        .callsFake(function() {
          if (typeof arguments[0] === 'function')
            arguments[0].apply(db, arguments);
          return db;
        });
      andWhereStub = stub(db, 'andWhere')
        .returns(db)
        .callsFake(function() {
          if (typeof arguments[0] === 'function')
            arguments[0].apply(db, arguments);
          return db;
        });
      offsetStub = stub(db, 'offset').returns(db);
      limitStub = stub(db, 'limit').returns(db);
      orWhereStub = stub(db, 'orWhere').returns(db);
      whereNotStub = stub(db, 'whereNot').returns(db);
      whereInStub = stub(db, 'whereIn').returns(db);
    });

    afterEach(() => {
      countStub.restore();
      fromStub.restore();
      innerJoinStub.restore();
      whereStub.restore();
      offsetStub.restore();
      limitStub.restore();
      orWhereStub.restore();
      andWhereStub.restore();
      whereNotStub.restore();
      whereInStub.restore();
    });

    it('Should return count satisfied employees', async () => {
      await countEmployeesByStatus({ employer_id, status, q });

      assert.calledWithExactly(
        countStub,
        `${TABLES.employeePositionSets}.id as count`
      );
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(
        innerJoinStub.getCall(0),
        TABLES.employeePositions,
        `${TABLES.employeePositions}.id`,
        '=',
        `${TABLES.employeePositionSets}.employee_position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(1),
        TABLES.positions,
        `${TABLES.positions}.id`,
        '=',
        `${TABLES.employeePositions}.position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(2),
        TABLES.employees,
        `${TABLES.employees}.evercheck_employee_id`,
        '=',
        `${TABLES.employeePositions}.evercheck_employee_id`
      );
      assert.calledWithExactly(whereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.employer_id`]: employer_id
      });
      assert.calledWithExactly(andWhereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.status`]: status
      });
      assert.calledWithExactly(orWhereStub.getCall(0), {
        [`${TABLES.employeePositionSets}.override_status`]: 1
      });
      assert.calledWithExactly(
        whereStub.getCall(2),
        `${TABLES.employees}.first_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(1),
        `${TABLES.employees}.last_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(2),
        `${TABLES.employees}.middle_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(3),
        `${TABLES.employees}.employee_number`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(4),
        `${TABLES.positions}.position_code`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(5),
        `${TABLES.positions}.description`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        whereNotStub,
        `${TABLES.employeePositionSets}.status`,
        'INACTIVE'
      );
    });

    it('Should return count satisfied employees with the given employee numbers', async () => {
      await countEmployeesByStatus({
        employer_id,
        status,
        q,
        employee_numbers
      });

      assert.calledWithExactly(
        countStub,
        `${TABLES.employeePositionSets}.id as count`
      );
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(
        innerJoinStub.getCall(0),
        TABLES.employeePositions,
        `${TABLES.employeePositions}.id`,
        '=',
        `${TABLES.employeePositionSets}.employee_position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(1),
        TABLES.positions,
        `${TABLES.positions}.id`,
        '=',
        `${TABLES.employeePositions}.position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(2),
        TABLES.employees,
        `${TABLES.employees}.evercheck_employee_id`,
        '=',
        `${TABLES.employeePositions}.evercheck_employee_id`
      );
      assert.calledWithExactly(whereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.employer_id`]: employer_id
      });
      assert.calledWithExactly(
        whereInStub,
        `${TABLES.employeePositions}.employee_number`,
        employee_numbers
      );
      assert.calledWithExactly(andWhereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.status`]: status
      });
      assert.calledWithExactly(orWhereStub.getCall(0), {
        [`${TABLES.employeePositionSets}.override_status`]: 1
      });
      assert.calledWithExactly(
        whereStub.getCall(2),
        `${TABLES.employees}.first_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(1),
        `${TABLES.employees}.last_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(2),
        `${TABLES.employees}.middle_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(3),
        `${TABLES.employees}.employee_number`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(4),
        `${TABLES.positions}.position_code`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(5),
        `${TABLES.positions}.description`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        whereNotStub,
        `${TABLES.employeePositionSets}.status`,
        'INACTIVE'
      );
    });

    it('Should return count satisfied employees without search criteria', async () => {
      await countEmployeesByStatus({ employer_id, status });

      assert.calledWithExactly(
        countStub,
        `${TABLES.employeePositionSets}.id as count`
      );
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(
        innerJoinStub.getCall(0),
        TABLES.employeePositions,
        `${TABLES.employeePositions}.id`,
        '=',
        `${TABLES.employeePositionSets}.employee_position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(1),
        TABLES.positions,
        `${TABLES.positions}.id`,
        '=',
        `${TABLES.employeePositions}.position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(2),
        TABLES.employees,
        `${TABLES.employees}.evercheck_employee_id`,
        '=',
        `${TABLES.employeePositions}.evercheck_employee_id`
      );
      assert.calledWithExactly(whereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.employer_id`]: employer_id
      });
      assert.calledWithExactly(andWhereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.status`]: status
      });
      assert.calledWithExactly(orWhereStub.getCall(0), {
        [`${TABLES.employeePositionSets}.override_status`]: 1
      });
      assert.calledWithExactly(
        whereNotStub,
        `${TABLES.employeePositionSets}.status`,
        'INACTIVE'
      );
      assert.callCount(whereStub, 2);
      assert.callCount(orWhereStub, 1);
    });

    it('Should return count employees without status satisfied and with search criteria', async () => {
      const notSatisfied = 'NOT_SATISFIED';

      await countEmployeesByStatus({ employer_id, status: notSatisfied, q });

      assert.calledWithExactly(
        countStub,
        `${TABLES.employeePositionSets}.id as count`
      );
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(
        innerJoinStub.getCall(0),
        TABLES.employeePositions,
        `${TABLES.employeePositions}.id`,
        '=',
        `${TABLES.employeePositionSets}.employee_position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(1),
        TABLES.positions,
        `${TABLES.positions}.id`,
        '=',
        `${TABLES.employeePositions}.position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(2),
        TABLES.employees,
        `${TABLES.employees}.evercheck_employee_id`,
        '=',
        `${TABLES.employeePositions}.evercheck_employee_id`
      );
      assert.calledWithExactly(whereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.employer_id`]: employer_id,
        [`${TABLES.employeePositionSets}.status`]: notSatisfied,
        [`${TABLES.employeePositionSets}.override_status`]: 0
      });
      assert.calledWithExactly(
        whereStub.getCall(2),
        `${TABLES.employees}.first_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(0),
        `${TABLES.employees}.last_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(1),
        `${TABLES.employees}.middle_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(2),
        `${TABLES.employees}.employee_number`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(3),
        `${TABLES.positions}.position_code`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(4),
        `${TABLES.positions}.description`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        whereNotStub,
        `${TABLES.employeePositionSets}.status`,
        'INACTIVE'
      );
    });

    it('Should return count employees without status satisfied', async () => {
      const notSatisfied = 'NOT_SATISFIED';

      await countEmployeesByStatus({ employer_id, status: notSatisfied });

      assert.calledWithExactly(
        countStub,
        `${TABLES.employeePositionSets}.id as count`
      );
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(
        innerJoinStub.getCall(0),
        TABLES.employeePositions,
        `${TABLES.employeePositions}.id`,
        '=',
        `${TABLES.employeePositionSets}.employee_position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(1),
        TABLES.positions,
        `${TABLES.positions}.id`,
        '=',
        `${TABLES.employeePositions}.position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(2),
        TABLES.employees,
        `${TABLES.employees}.evercheck_employee_id`,
        '=',
        `${TABLES.employeePositions}.evercheck_employee_id`
      );
      assert.calledWithExactly(whereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.employer_id`]: employer_id,
        [`${TABLES.employeePositionSets}.status`]: notSatisfied,
        [`${TABLES.employeePositionSets}.override_status`]: 0
      });
      assert.calledWithExactly(
        whereNotStub,
        `${TABLES.employeePositionSets}.status`,
        'INACTIVE'
      );
      assert.callCount(whereStub, 2);
      assert.callCount(orWhereStub, 0);
    });
  });

  describe('getEmployeesByStatus', () => {
    let selectStub,
      fromStub,
      innerJoinStub,
      whereStub,
      offsetStub,
      limitStub,
      orWhereStub,
      andWhereStub,
      whereNotStub,
      orderByStub,
      whereInStub;

    const employer_id = 365,
      status = 'SATISFIED',
      offset = 0,
      limit = 10,
      q = '12345';
    const employee_numbers = [1, 2, 3, 4, 5];
    const data = [
      {
        first_name: 'Mindi',
        last_name: 'Burfield',
        middle_name: '',
        position_code: '00392X',
        status: 'SATISFIED'
      },
      {
        first_name: 'Lisa',
        last_name: 'Maylish',
        middle_name: '',
        position_code: '10149X',
        status: 'SATISFIED'
      }
    ];

    const select = [
      `${TABLES.employees}.first_name as firstName`,
      `${TABLES.employees}.last_name as lastName`,
      `${TABLES.employees}.middle_name as middleName`,
      `${TABLES.positions}.position_code as positionCode`,
      `${TABLES.positions}.description as positionName`,
      `${TABLES.employeePositionSets}.status as requirementStatus`,
      `${TABLES.employees}.employee_number as employeeNumber`,
      `${TABLES.employees}.evercheck_employee_id as id`,
      `${TABLES.employeePositionSets}.id as setId`,
      `${TABLES.employeePositionSets}.start_date as startDate`,
      `${TABLES.employeePositionSets}.override_status as overrideStatus`,
      `${TABLES.employeePositionSets}.key as workgroups`
    ];

    beforeEach(() => {
      selectStub = stub(db, 'select').returns(db);
      fromStub = stub(db, 'from').returns(db);
      innerJoinStub = stub(db, 'innerJoin').returns(db);
      whereStub = stub(db, 'where')
        .returns(db)
        .callsFake(function() {
          if (typeof arguments[0] === 'function')
            arguments[0].apply(db, arguments);
          return db;
        });
      andWhereStub = stub(db, 'andWhere')
        .returns(db)
        .callsFake(function() {
          if (typeof arguments[0] === 'function')
            arguments[0].apply(db, arguments);
          return db;
        });
      offsetStub = stub(db, 'offset').returns(db);
      limitStub = stub(db, 'limit').returns(db);
      orWhereStub = stub(db, 'orWhere').returns(db);
      whereNotStub = stub(db, 'whereNot').returns(db);
      orderByStub = stub(db, 'orderBy').returns(db);
      whereInStub = stub(db, 'whereIn').returns(db);
    });

    afterEach(() => {
      selectStub.restore();
      fromStub.restore();
      innerJoinStub.restore();
      whereStub.restore();
      offsetStub.restore();
      limitStub.restore();
      orWhereStub.restore();
      andWhereStub.restore();
      whereNotStub.restore();
      orderByStub.restore();
      whereInStub.restore();
    });

    it('Should return all satisfied employees', async () => {
      offsetStub.resolves(data);

      const result = await getEmployeesByStatus({
        employer_id,
        status,
        offset,
        limit,
        q
      });

      expect(result).to.be.eql(data);

      assert.calledWithExactly(selectStub, select);
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(
        innerJoinStub.getCall(0),
        TABLES.employeePositions,
        `${TABLES.employeePositions}.id`,
        '=',
        `${TABLES.employeePositionSets}.employee_position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(1),
        TABLES.positions,
        `${TABLES.positions}.id`,
        '=',
        `${TABLES.employeePositions}.position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(2),
        TABLES.employees,
        `${TABLES.employees}.evercheck_employee_id`,
        '=',
        `${TABLES.employeePositions}.evercheck_employee_id`
      );
      assert.calledWithExactly(whereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.employer_id`]: employer_id
      });
      assert.calledWithExactly(andWhereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.status`]: status
      });
      assert.calledWithExactly(orWhereStub.getCall(0), {
        [`${TABLES.employeePositionSets}.override_status`]: 1
      });
      assert.calledWithExactly(
        whereStub.getCall(2),
        `${TABLES.employees}.first_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(1),
        `${TABLES.employees}.last_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(2),
        `${TABLES.employees}.middle_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(3),
        `${TABLES.employees}.employee_number`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(4),
        `${TABLES.positions}.position_code`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(5),
        `${TABLES.positions}.description`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        whereNotStub,
        `${TABLES.employeePositionSets}.status`,
        'INACTIVE'
      );
      assert.calledWithExactly(orderByStub, [
        `${TABLES.employees}.last_name`,
        `${TABLES.employees}.first_name`
      ]);
      assert.calledWithExactly(limitStub, limit);
      assert.calledWithExactly(offsetStub, offset);
    });

    it('Should return count satisfied employees with the given employee numbers', async () => {
      offsetStub.resolves(data);

      const result = await getEmployeesByStatus({
        employer_id,
        status,
        employee_numbers,
        offset,
        limit,
        q
      });

      expect(result).to.be.eql(data);

      assert.calledWithExactly(selectStub, select);
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(
        innerJoinStub.getCall(0),
        TABLES.employeePositions,
        `${TABLES.employeePositions}.id`,
        '=',
        `${TABLES.employeePositionSets}.employee_position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(1),
        TABLES.positions,
        `${TABLES.positions}.id`,
        '=',
        `${TABLES.employeePositions}.position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(2),
        TABLES.employees,
        `${TABLES.employees}.evercheck_employee_id`,
        '=',
        `${TABLES.employeePositions}.evercheck_employee_id`
      );
      assert.calledWithExactly(whereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.employer_id`]: employer_id
      });
      assert.calledWithExactly(
        whereInStub,
        `${TABLES.employeePositions}.employee_number`,
        employee_numbers
      );
      assert.calledWithExactly(andWhereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.status`]: status
      });
      assert.calledWithExactly(orWhereStub.getCall(0), {
        [`${TABLES.employeePositionSets}.override_status`]: 1
      });
      assert.calledWithExactly(
        whereStub.getCall(2),
        `${TABLES.employees}.first_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(1),
        `${TABLES.employees}.last_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(2),
        `${TABLES.employees}.middle_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(3),
        `${TABLES.employees}.employee_number`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(4),
        `${TABLES.positions}.position_code`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(5),
        `${TABLES.positions}.description`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        whereNotStub,
        `${TABLES.employeePositionSets}.status`,
        'INACTIVE'
      );
      assert.calledWithExactly(orderByStub, [
        `${TABLES.employees}.last_name`,
        `${TABLES.employees}.first_name`
      ]);
      assert.calledWithExactly(limitStub, limit);
      assert.calledWithExactly(offsetStub, offset);
    });

    it('Should return all satisfied employees without search criteria', async () => {
      offsetStub.resolves(data);

      const result = await getEmployeesByStatus({
        employer_id,
        status,
        offset,
        limit
      });

      expect(result).to.be.eql(data);

      assert.calledWithExactly(selectStub, select);
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(
        innerJoinStub.getCall(0),
        TABLES.employeePositions,
        `${TABLES.employeePositions}.id`,
        '=',
        `${TABLES.employeePositionSets}.employee_position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(1),
        TABLES.positions,
        `${TABLES.positions}.id`,
        '=',
        `${TABLES.employeePositions}.position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(2),
        TABLES.employees,
        `${TABLES.employees}.evercheck_employee_id`,
        '=',
        `${TABLES.employeePositions}.evercheck_employee_id`
      );
      assert.calledWithExactly(whereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.employer_id`]: employer_id
      });
      assert.calledWithExactly(andWhereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.status`]: status
      });
      assert.calledWithExactly(orWhereStub.getCall(0), {
        [`${TABLES.employeePositionSets}.override_status`]: 1
      });
      assert.calledWithExactly(orderByStub, [
        `${TABLES.employees}.last_name`,
        `${TABLES.employees}.first_name`
      ]);
      assert.calledWithExactly(limitStub, limit);
      assert.calledWithExactly(offsetStub, offset);
      assert.callCount(whereStub, 2);
      assert.callCount(orWhereStub, 1);
    });

    it('Should return all employees without status satisfied and with search criteria', async () => {
      const notSatisfied = 'NOT_SATISFIED';
      offsetStub.resolves(data);

      const result = await getEmployeesByStatus({
        employer_id,
        status: notSatisfied,
        offset,
        limit,
        q
      });

      expect(result).to.be.eql(data);

      assert.calledWithExactly(selectStub, select);
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(
        innerJoinStub.getCall(0),
        TABLES.employeePositions,
        `${TABLES.employeePositions}.id`,
        '=',
        `${TABLES.employeePositionSets}.employee_position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(1),
        TABLES.positions,
        `${TABLES.positions}.id`,
        '=',
        `${TABLES.employeePositions}.position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(2),
        TABLES.employees,
        `${TABLES.employees}.evercheck_employee_id`,
        '=',
        `${TABLES.employeePositions}.evercheck_employee_id`
      );
      assert.calledWithExactly(whereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.employer_id`]: employer_id,
        [`${TABLES.employeePositionSets}.status`]: notSatisfied,
        [`${TABLES.employeePositionSets}.override_status`]: 0
      });
      assert.calledWithExactly(
        whereStub.getCall(2),
        `${TABLES.employees}.first_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(0),
        `${TABLES.employees}.last_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(1),
        `${TABLES.employees}.middle_name`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(2),
        `${TABLES.employees}.employee_number`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(3),
        `${TABLES.positions}.position_code`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        orWhereStub.getCall(4),
        `${TABLES.positions}.description`,
        'like',
        `%${q}%`
      );
      assert.calledWithExactly(
        whereNotStub,
        `${TABLES.employeePositionSets}.status`,
        'INACTIVE'
      );
      assert.calledWithExactly(orderByStub, [
        `${TABLES.employees}.last_name`,
        `${TABLES.employees}.first_name`
      ]);
      assert.calledWithExactly(limitStub, limit);
      assert.calledWithExactly(offsetStub, offset);
    });

    it('Should return all employees without status satisfied and without search criteria', async () => {
      const notSatisfied = 'NOT_SATISFIED';
      offsetStub.resolves(data);

      const result = await getEmployeesByStatus({
        employer_id,
        status: notSatisfied,
        offset,
        limit
      });

      expect(result).to.be.eql(data);

      assert.calledWithExactly(selectStub, select);
      assert.calledWithExactly(fromStub, TABLES.employeePositionSets);
      assert.calledWithExactly(
        innerJoinStub.getCall(0),
        TABLES.employeePositions,
        `${TABLES.employeePositions}.id`,
        '=',
        `${TABLES.employeePositionSets}.employee_position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(1),
        TABLES.positions,
        `${TABLES.positions}.id`,
        '=',
        `${TABLES.employeePositions}.position_id`
      );
      assert.calledWithExactly(
        innerJoinStub.getCall(2),
        TABLES.employees,
        `${TABLES.employees}.evercheck_employee_id`,
        '=',
        `${TABLES.employeePositions}.evercheck_employee_id`
      );
      assert.calledWithExactly(whereStub.getCall(1), {
        [`${TABLES.employeePositionSets}.employer_id`]: employer_id,
        [`${TABLES.employeePositionSets}.status`]: notSatisfied,
        [`${TABLES.employeePositionSets}.override_status`]: 0
      });
      assert.calledWithExactly(orderByStub, [
        `${TABLES.employees}.last_name`,
        `${TABLES.employees}.first_name`
      ]);
      assert.calledWithExactly(limitStub, limit);
      assert.calledWithExactly(offsetStub, offset);
      assert.callCount(whereStub, 2);
      assert.callCount(orWhereStub, 0);
    });
  });
});
