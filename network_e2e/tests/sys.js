
var exec = require('child_process').exec;
var network = require('network');

var WIN_DISABLE_NIC_CMD = 'powershell "Get-NetAdapter | Enable-NetAdapter -Confirm:$false"';
var LINUX_DISABLE_NIC_CMD = 'ifdown eth0';
var DOCKER_DISCONNECT_NETWORK = 'docker disconnect %s %s';
var WIN_DOCKER_SOCKET = 'tcp://%s:2375';
var LINUX_DOCKER_SOCKET = '/var/run/docker.sock';
var WIN_FIREWALL_RULE = 'powershell "New-NetFirewallRule -Name %s -Direction Outbound -Protocol Tcp -Action Block -RemotePort %s"';
var LINUX_FIREWALL_RULE = '';
var AMQP_FIREWALL_RULE_NAME = 'BlockAmqp';
var MQTT_FIREWALL_RULE_NAME = 'BlockMqtt';
var HTTPS_FIREWALL_RULE_NAME = 'BlockHttps';
var AMQP_PORT = 5671;
var MQTT_PORT = 8883;
var HTTPS_PORT = 443;

module.exports = {
  docker: {
    disconnectNetwork: function(natName, hostname, callback) {
      exec(util.format(DOCKER_DISCONNECT_NETWORK, natName, hostname), callback);
    }
  },
  win32: {
    disableNic: function (callback) {
      exec(WIN_DISABLE_NIC_CMD, callback);
    },
    getContainerId: function() {
      return process.env.COMPUTERNAME;
    },
    getDockerSocket: function(callback) {
      network.get_gateway_ip(function (err, ip) {
        if(err) {
          return callback(err);
        } else { 
          return callback(null, util.format(WIN_DOCKER_SOCKET,ip));
        }
      });
    },
    blockAmqp: function(callback) {
      exec(util.format(WIN_FIREWALL_RULE, AMQP_FIREWALL_RULE_NAME, AMQP_PORT), callback);
    },
    blockMqtt: function(callback) {
      exec(util.format(WIN_FIREWALL_RULE, MQTT_FIREWALL_RULE_NAME, MQTT_PORT), callback);
    },
    blockHttps: function(callback) {
      exec(util.format(WIN_FIREWALL_RULE, HTTPS_FIREWALL_RULE_NAME, HTTPS_PORT), callback);
    }
  },
  linux: {
    disableNic: function (callback) {
      exec(LINUX_DISABLE_NIC_CMD, callback);
    },
    getContainerId: function() {
      return process.env.HOSTNAME;
    },
    getDockerSocket: function(callback) {
      callback(null, LINUX_DOCKER_SOCKET);
    },
    blockAmqp: function(callback) {
      exec(util.format(LINUX_FIREWALL_RULE, AMQP_FIREWALL_RULE_NAME, AMQP_PORT), callback);
    },
    blockMqtt: function(callback) {
      exec(util.format(LINUX_FIREWALL_RULE, MQTT_FIREWALL_RULE_NAME, MQTT_PORT), callback);
    },
    blockHttps: function(callback) {
      exec(util.format(LINUX_FIREWALL_RULE, HTTPS_FIREWALL_RULE_NAME, HTTPS_PORT), callback);
    }
  }
};