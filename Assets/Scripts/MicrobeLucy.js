﻿#pragma strict

public class MicrobeLucy extends WalkingMicrobe {
	
	public var jumpForce: Vector2 = Vector2(5, 50);
	
	private var jumped: boolean = false;
	private var canJump: boolean = false;
	private var colliders: Collider2D[];
	private var yoghurtPosition: int; 				//+1 if the yoghurt is on the right, and -1 if it is on the left. Used to decide the direction of the jump.
	
	function Awake () {
	
		super.Awake();
		jumped = false;
		canJump = false;
		
	}
	
	function OnTriggerEnter2D(collisionInfo : Collider2D){
		
		var objectHit: GameObject = collisionInfo.gameObject;
		
		if(objectHit.tag == "Yoghurt"){
			if(objectHit.transform.position.x > myTransform.position.x)			//The yoghurt is on the right.
				yoghurtPosition = 1; 
			else
				yoghurtPosition = -1; 
			Debug.Log("Lucy: Trigger entered. Yoghurt detected!");
			canJump = true;
			//if (!jumped) jumpToYoghurt();
		}
		
		else{
			Debug.Log("Lucy: Trigger entered, but not Yoghurt");
			super.OnTriggerEnter2D(collisionInfo);								//To call the OnTriggerEnter2D of WalkingMicrobe's script.
		}
		
	}
	
	function OnTriggerExit2D(other: Collider2D) {
		Debug.Log("Lucy: Trigger exited.");
		canJump = false;
	}
	
	//If Lucy is hit while standing in the area near the yoghurt where it can jump, it jumps
	function OnCollisionEnter2D (coll: Collision2D) {
		if(canJump && coll.collider.gameObject.layer == utils.layers.player){
			if (!jumped) jumpToYoghurt();
		}
		else
			super.OnCollisionEnter2D(coll);
		
	}
	
	private function jumpToYoghurt() {
		iTween.Stop(gameObject);						//Stops all the iTweens of this gameObject
		jumpForce.x = jumpForce.x * yoghurtPosition;					//To jump left or right depending on the position of the yoghurt
		myTransform.rigidbody2D.AddForce(jumpForce);
		jumped = true;
		anim.SetTrigger("dive");
		
		colliders = FindObjectsOfType(Collider2D);
		
		var colliders = GetComponents(Collider2D);// as Collider2D[];		//Cast from Object to Collider2D
		for (var myCollider : Collider2D in colliders) {
			myCollider.enabled = false;
		}
		
		Destroy(gameObject, 3);
	}
	
}