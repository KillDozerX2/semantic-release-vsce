const sinon = require('sinon');
const test = require('ava');
const proxyquire = require('proxyquire');

const logger = {
  log: sinon.fake()
};

test.beforeEach(t => {
  t.context.stubs = {
    execaStub: sinon.stub()
  };
});

test.afterEach(t => {
  t.context.stubs.execaStub.resetHistory();
});

test('packageVsix is not specified', async t => {
  const { execaStub } = t.context.stubs;
  const prepare = proxyquire('../lib/prepare', {
    execa: execaStub
  });

  const version = '1.0.0';
  await prepare(version, undefined, logger);

  t.true(execaStub.notCalled);
});

test('packageVsix is a string', async t => {
  const { execaStub } = t.context.stubs;
  const prepare = proxyquire('../lib/prepare', {
    execa: execaStub
  });

  const version = '1.0.0';
  const packageVsix = 'test.vsix';
  const packagePath = packageVsix;
  const result = await prepare(version, packageVsix, logger);

  t.deepEqual(result, packagePath);
  t.deepEqual(execaStub.getCall(0).args, ['vsce', ['package', version, '--no-git-tag-version', '--out', packagePath], { stdio: 'inherit' }]);
});

test('packageVsix is true', async t => {
  const { execaStub } = t.context.stubs;
  const name = 'test';

  const prepare = proxyquire('../lib/prepare', {
    execa: execaStub,
    'fs-extra': {
      readJson: sinon.stub().returns({
        name
      })
    }
  });

  const version = '1.0.0';
  const packageVsix = true;
  const packagePath = `${name}-${version}.vsix`;

  const result = await prepare(version, packageVsix, logger);

  t.deepEqual(result, packagePath);
  t.deepEqual(execaStub.getCall(0).args, ['vsce', ['package', version, '--no-git-tag-version', '--out', packagePath], { stdio: 'inherit' }]);
});

test('packageVsix is not set but OVSX_PAT is', async t => {
  const { execaStub } = t.context.stubs;
  const name = 'test';

  const prepare = proxyquire('../lib/prepare', {
    execa: execaStub,
    'fs-extra': {
      readJson: sinon.stub().returns({
        name
      })
    }
  });

  sinon.stub(process, 'env').value({
    OVSX_PAT: 'abc123'
  });

  const version = '1.0.0';
  const packageVsix = undefined;
  const packagePath = `${name}-${version}.vsix`;

  const result = await prepare(version, packageVsix, logger);

  t.deepEqual(result, packagePath);
  t.deepEqual(execaStub.getCall(0).args, ['vsce', ['package', version, '--no-git-tag-version', '--out', packagePath], { stdio: 'inherit' }]);
});
