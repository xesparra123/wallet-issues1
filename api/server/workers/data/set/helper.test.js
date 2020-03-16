const { expect } = require('chai');

const { calculateStatus, hasExcludedStatus } = require('./helper');

describe('Employee Position Set helper', () => {
  describe('Calculate Status', () => {
    const credentials = [{ professionCode: 'BLS', profession: 'BLS' }],
      startDate = '11/20/2019';

    describe('The status is SATISFIED', () => {
      it('When the requirements is empty', () => {
        const reqs = [];
        const result = calculateStatus({ reqs, credentials, startDate });
        expect(result).to.be.equal('SATISFIED');
      });

      it('When the validations status return SATISFIED', () => {
        const reqs = [
          { profession: { code: 'BLS', name: 'BLS' }, isTbo: false, group: 0 }
        ];

        const result = calculateStatus({ reqs, credentials, startDate });
        expect(result).to.be.equal('SATISFIED');
      });
    });

    describe('The status is NOT SATISFIED', () => {
      const reqs = [
        {
          profession: { code: 'BLS', name: 'BLS' },
          isTbo: true,
          tboDays: 2,
          group: 1
        }
      ];

      it('When the validations status return NOT SATISFIED', () => {
        const result = calculateStatus({
          reqs,
          credentials: [],
          startDate: undefined
        });
        expect(result).to.be.equal('NOT_SATISFIED');
      });

      it('When the process validate the credentials', () => {
        const result = calculateStatus({
          reqs,
          credentials,
          startDate: undefined
        });
        expect(result).to.be.equal('SATISFIED');
      });
    });
  });

  describe('hasExcludedStatus', () => {
    const licenses = [
      {
        active: true,
        status: [],
        professionCode: 'BLS',
        profession: 'BLS',
        label: 'CLEAR',
        expirationDate: '11/20/19'
      }
    ];
    it('When the liceses dont have errors', () => {
      const result = hasExcludedStatus({ licenses });
      expect(result).to.be.eql(licenses);
    });
  });
});
