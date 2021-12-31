'use strict';


const GC_INTERVAL = 100;


function Pool(create) {
  this.create = create;

  this.available = [];
  this.acquired = {};
  this.lastId = 1;

  this.timeoutId = 0;
}


Pool.prototype.acquire = function () {
  let resource;

  if (this.available.length !== 0) {
    resource = this.available.pop();
  } else {
    resource = this.create();
    resource.id = this.lastId++;
    resource.release = () => this.release(resource);
  }
  this.acquired[resource.id] = resource;
  return resource;
};


Pool.prototype.release = function (resource) {
  delete this.acquired[resource.id];
  this.available.push(resource);

  if (this.timeoutId === 0) {
    this.timeoutId = setTimeout(() => this.gc(), GC_INTERVAL);
  }
};


Pool.prototype.gc = function () {
  this.available = this.available.filter(resource => {
    resource.destroy();
    return false;
  });

  this.timeoutId = 0;
};


module.exports = Pool;
