@setlocal
@echo off

set SDK_ROOT=C:\\node-sdk
set TESTS_ROOT=%SDK_ROOT%\\network_e2e\\tests

call docker build ^
 --build-arg SDK_ROOT=%SDK_ROOT% ^
 -t nodebuild/net_e2e_test ^
Dockerfile.windows
if errorlevel 1 goto :eof

pushd test-devices
call npm install
if errorlevel 1 goto :eof

for /F "tokens=* USEBACKQ" %%F IN (`node create-device.js`) DO (
  set DEVICE_CONNECTION_STRING=%%F
)
if errorlevel 1 goto :eof
popd

call docker run ^
 -v .:%SDK_ROOT% ^
 nodebuild/net_e2e_test ^
 node %TESTS_ROOT%\\index.js --protocol=amqp --testName=bad_nic --connectionString=%DEVICE_CONNECTION_STRING%
if errorlevel 1 goto :eof

pushd test-devices
call node delete-device.js %DEVICE_CONNECTION_STRING%
if errorlevel 1 goto :eof
popd

@endlocal
