import * as THREE from 'three'
import { checkCollision } from '../GenerateProps';



export default class Particle {
    constructor() {
	this.position = new THREE.Vector3().randomDirection();
	this.direction = new THREE.Vector3(-1,0,0);
	this.velocity = this.direction.clone(); 
	this.wanderAngle = 0;

	this.move = function (particles, params) {
		if (Math.random() < 0.5) {
			var seekingForce = new THREE.Vector3(0, 0,2)
		} else {
			var seekingForce = new THREE.Vector3(-1, 0, 0)
		}
		const forces = []
		var collisionResult = checkCollision(this.position, 0.4)
		if (!(collisionResult === undefined)) {
			forces.push(this.calculateTangent(collisionResult).multiplyScalar(50),
			this.wander().multiplyScalar(20),
			this.separation(particles).multiplyScalar(2.2),)
		} else {
			forces.push(
				this.seek(seekingForce).multiplyScalar(20),		
				this.alignment(particles).multiplyScalar(0.01),
				this.cohesion(particles).multiplyScalar(20),
				this.separation(particles).multiplyScalar(2.2),
				this.wander().multiplyScalar(20),
				this.separation(particles),
				this.wander().multiplyScalar(20))
		}


		const steeringForce = new THREE.Vector3(0, 0, 0);
    	for (const f of forces) {
      		steeringForce.add(f);
    	} steeringForce.multiplyScalar(0.01);

		steeringForce.setComponent(1, 0)
		if (steeringForce.length() > 0.01) {
			steeringForce.normalize();
			steeringForce.multiplyScalar(0.001);
		}
		this.velocity.add(steeringForce)
		this.velocity.setComponent(1, 0); 
		if (this.velocity.length() > 0.01) {
			this.velocity.normalize();
			this.velocity.multiplyScalar(0.01);
		}

	  // check collision with glass 
	  this.checkEdge(this.velocity);
	  this.velocity.setComponent(1, 0);
	  this.direction = this.velocity.clone();
	  this.direction.normalize();

	  const frameVelocity = this.velocity.clone()
	  if (params.snowSpeed >= 1) {
		frameVelocity.multiplyScalar(0.8 * params.snowSpeed)
	  } else {
		frameVelocity.multiplyScalar(0.9)
	  }
	  this.position.add(frameVelocity);
	};

	this.calculateTangent = function(collisionResult) {
		var vec1 = new THREE.Vector3(0,0,0);
		vec1.subVectors(this.position, collisionResult.pos)
		vec1.addVectors(vec1.multiplyScalar(20),  new THREE.Vector3(vec1.z, vec1.y, -1 * vec1.x))
		return vec1.normalize()
	}; 

    this.checkEdge = function(vector) {
        let offset = 0.01; 

		if ((Math.sqrt(this.position.x * this.position.x + this.position.z * this.position.z) >= 4.9)
		|| this.position.length() === 0)  {
			this.velocity.multiplyScalar(-1);
			this.position.x < 0 ? this.position.x += offset : this.position.x -= offset;
			this.position.z < 0 ? this.position.z += offset : this.position.z -= offset;
		}
    }

	this.wander = function() {
		this.wanderAngle += 0.2 * THREE.MathUtils.randFloat(-2 * Math.PI, Math.PI);
		const randomPointOnCircle = new THREE.Vector3(
			Math.cos(this.wanderAngle),
			0,
			Math.sin(this.wanderAngle));
		const pointAhead = this.direction.clone();
		pointAhead.multiplyScalar(2);
		pointAhead.add(randomPointOnCircle);
		pointAhead.normalize();
		return pointAhead
	}

	this.seek = function(dest) {
		var direction = new THREE.Vector3(0,0,0);
		const distance = Math.max(0,((
			this.position.distanceTo(dest) - 1) / 5)) ** 2;

		direction = dest.clone().subVectors(dest, this.position);
		direction.normalize();
		direction.multiplyScalar(distance)
		return direction
	  }

	this.alignment = function (particles) {
		var particle, total = new THREE.Vector3(0,0,0),
		count = 0;

		for (var i = 0, n = particles.length; i < n; i++) {
			particle = particles[i];
			total.add(particle.direction);
		}
		total.normalize()
		total.multiplyScalar(10)
		return total; 
		}

	this.cohesion = function (particles) {
		var particle, distance,
		sum = new THREE.Vector3(),
		steer = new THREE.Vector3(),
		count = 0;

		for (var i = 0, n = particles.length; i < n; i ++) {
			particle = particles[i];
			distance = particle.position.distanceTo(this.position);

			if (distance > 0) {
				sum.add(particle.position);
				count++;
			}
		}

		if (count > 0) {
			sum.divideScalar(count);
		}

		const directionToAvgPosition = sum.clone().subVectors(sum, this.position)
		directionToAvgPosition.normalize()
		directionToAvgPosition.multiplyScalar(10)


		return directionToAvgPosition;
	};

	this.separation = function (particles) {
		var particle, distance
		var sum = new THREE.Vector3(),
		repulse = new THREE.Vector3();

		for (var i = 0, n = particles.length; i < n; i ++) {
			particle = particles[i];
			distance = particle.position.distanceTo(this.position);
			if (distance > 0) {
			const distanceToEntity = Math.max(
				particle.position.distanceTo(this.position),
				0.01);
			const directionFromEntity = new THREE.Vector3().subVectors(
				this.position, particle.position);
			directionFromEntity.normalize();
			const multiplier = (
				20 / distanceToEntity);
			sum.add(directionFromEntity.multiplyScalar(multiplier))
			}
		}
		return sum;
		
	};
}};