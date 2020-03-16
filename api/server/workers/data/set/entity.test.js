const Entity = require('./entity');
const { expect } = require('chai');
const { stub } = require('sinon');
const Repository = require('./repository');

describe('Entity test', () => {
  let findById, updateStatusStub;

  const id = 123,
    status = 'queued';

  beforeEach(() => {
    findById = stub(Repository, 'findById');
    updateStatusStub = stub(Repository, 'updateStatus');
  });

  afterEach(() => {
    findById.restore();
    updateStatusStub.restore();
  });

  it('call findById function', async () => {
    const returnData = { setId: 123 };
    findById.returns(returnData);
    const entity = new Entity({
      id: 123
    });
    const response = await entity.findById();
    expect(response).to.be.eql(returnData);
  });

  it('call updateStatus function', async () => {
    const returnData = [10];
    updateStatusStub.returns(returnData);
    const entity = new Entity({ id, status });
    const response = await entity.updateStatus();
    expect(response).to.be.eql(returnData);
  });
});
