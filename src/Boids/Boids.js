import * as THREE from 'three'
export default class Particle {
    constructor() {
	this.position = new THREE.Vector3();
	this.velocity = new THREE.Vector3().randomDirection();
    this.velocity.multiplyScalar(0.01);
	var _acceleration = new THREE.Vector3();

	var _depth, _height, _width, _goal, _padding = 5, _speed = 0.1,
		_maneuver = 0.2;

	this.setBoundaries = function (width, height, depth) {
		_width = width;
		_height = height;
		_depth = depth;
	};

	this.swim = function (particles) {
		// prevent boundary collisions
		// var vector = new THREE.Vector3();
		// vector.set(- _width, this.position.y, this.position.z);
		// vector = this.avoid(vector);
		// // vector.multiplyScalar(5);
        // vector.setComponent(1, 0); 
		// _acceleration.add(vector);

		// vector.set(_width, this.position.y, this.position.z);
		// vector = this.avoid(vector);
		// // vector.multiplyScalar(5);
        // vector.setComponent(1, 0); 
		// _acceleration.add(vector);

		// vector.set(this.position.x, - _height, this.position.z);
		// vector = this.avoid(vector);
		// // vector.multiplyScalar(5);
        // vector.setComponent(1, 0); 
		// _acceleration.add(vector);

		// vector.set(this.position.x, _height, this.position.z);
		// vector = this.avoid(vector);
		// // vector.multiplyScalar(5);
        // vector.setComponent(1, 0); 
		// _acceleration.add(vector);

		// vector.set(this.position.x, this.position.y, - _depth);
		// vector = this.avoid(vector);
		// vector.multiplyScalar(5);
        // vector.setComponent(1, 0); 
		// _acceleration.add(vector);

		// vector.set(this.position.x, this.position.y, _depth);
		// vector = this.avoid(vector);
		// // vector.multiplyScalar(5);
        // vector.setComponent(1, 0); 
		// _acceleration.add(vector);

		// // if (Math.random() > 0.5) {
		// 	this.flock(particles);
        // // }
        // var vector = new THREE.Vector3();
        // // console.log("boids")
        // vector.randomDirection();
        this.checkEdge(this.velocity);
        // console.log(this.velocity)
        this.velocity.setComponent(1, 0); 
        // vector.multiplyScalar(0.5);
        // this.position.lerp(vector, 0.1);
        this.position.add(this.velocity);
        // _acceleration.add(vector);

		// this.move();
	};

    this.checkEdge = function(vector) {
        let nedge = -3.5;
        let edge = 3.5; 
        let offset = 0.1; 
        // console.log(this.position)
        if (this.position.x < nedge) {
            this.position.x += offset;
            vector.x *= -1; 
        } else if (this.position.x > edge) {
            this.position.x -= offset;
            vector.x *=-1; 
        }

        if (this.position.z < nedge) {
            this.position.z += offset;
            vector.z *=-1; 
        } else if (this.position.z > edge) {
            this.position.z -= offset;
            vector.z *=-1; 
        }
        // return vector 
    }

	// this.flock = function (particles) {
	// 	if (_goal)
	// 		_acceleration.add(this.reach(_goal, 0.0002));

	// 	_acceleration.add(this.alignment(particles));
	// 	_acceleration.add(this.cohesion(particles));
	// 	_acceleration.add(this.separation(particles));
	// };

	// this.move = function () {
	// 	this.velocity.add(_acceleration);

	// 	// if (this.velocity.length() > _speed)
	// 	// 	this.velocity.divideScalar(this.velocity.length() / _speed);

	// 	this.position.add(this.velocity);
	// 	_acceleration.set(0, 0, 0);
	// };

	// this.avoid = function (target) {
	// 	var steer = new THREE.Vector3();

	// 	steer.copy(this.position);
	// 	steer.sub(target);
	// 	steer.multiplyScalar(1 / this.position.distanceToSquared(target));

	// 	return steer;
	// };

	// this.repulse = function (target) {
	// 	var distance = this.position.distanceTo(target);

	// 	if (distance < 150) {
	// 		var steer = new THREE.Vector3();

	// 		steer.subVectors(this.position, target);
	// 		steer.multiplyScalar(0.5 / distance);
    //         vector.setComponent(1, 0); 

	// 		_acceleration.add(steer);
	// 	}
	// };

	// this.reach = function (target, amount) {
	// 	var steer = new THREE.Vector3();

	// 	steer.subVectors(target, this.position);
	// 	steer.multiplyScalar(amount);

	// 	return steer;
	// };

	// this.alignment = function (particles) {
	// 	var particle, total = new THREE.Vector3(),
	// 	count = 0;

	// 	for (var i = 0, n = particles.length; i < n; i++) {
	// 		if (Math.random() > 0.6)
	// 			continue;

	// 		particle = particles[i];
	// 		var distance = particle.position.distanceTo(this.position);

	// 		if (distance > 0 && distance <= _padding) {
	// 			total.add(particle.velocity);
	// 			count++;
	// 		}
	// 	}

	// 	if (count > 0) {
	// 		total.divideScalar(count);

	// 		if (total.length() > _maneuver)
	// 			total.divideScalar(total.length() / _maneuver);
	// 	}

	// 	return total;
	// };

	// this.cohesion = function (particles) {
	// 	var particle, distance,
	// 	sum = new THREE.Vector3(),
	// 	steer = new THREE.Vector3(),
	// 	count = 0;

	// 	for (var i = 0, n = particles.length; i < n; i ++) {

	// 		if (Math.random() > 0.6)
	// 			continue;

	// 		particle = particles[i];
	// 		distance = particle.position.distanceTo(this.position);

	// 		if (distance > 0 && distance <= _padding) {
	// 			sum.add(particle.position);
	// 			count++;
	// 		}
	// 	}

	// 	if (count > 0)
	// 		sum.divideScalar(count);

	// 	steer.subVectors(sum, this.position);

	// 	if (steer.length() > _maneuver)
	// 		steer.divideScalar(steer.length() / _maneuver);

	// 	return steer;
	// };

	// this.separation = function (particles) {
	// 	var particle, distance,
	// 	sum = new THREE.Vector3(),
	// 	repulse = new THREE.Vector3();

	// 	for (var i = 0, n = particles.length; i < n; i ++) {
	// 		if (Math.random() > 0.6)
	// 			continue;

	// 		particle = particles[i];
	// 		distance = particle.position.distanceTo(this.position);

	// 		if (distance > 0 && distance <= _padding) {
	// 			repulse.subVectors(this.position, particle.position);
	// 			repulse.normalize();
	// 			repulse.divideScalar(distance);
    //             repulse.setComponent(1, 0); 
	// 			sum.add(repulse);
	// 		}
	// 	}

	// 	return sum;
	// };
}};