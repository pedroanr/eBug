﻿#pragma strict

var otherCharacter : GameObject;
private var thisCharacterAnimator : Animator;
private var otherCharacterAnim : Animator;

private var selMode : boolean;

var levelLogic : GameObject;			//To keep a reference to the LevelLogic object, which is the GameObject that has attached the LevelLogicGameShow.js script that controls the logic (behaviour) of the actual level
private var levelLogicGameShow : LevelLogicGameShow;
/*

This class controls the animations of the character when the player has to select one of the characters to play with.

*/

function Awake () {
	
	thisCharacterAnimator = gameObject.GetComponent(Animator);
	otherCharacterAnim = otherCharacter.GetComponent(Animator);
	
	selMode = false;
	
}

function Start () {
	
	//Store the reference to the LevelLogicGameShow.js script, which controls the logic (behaviour) of the actual level
	levelLogicGameShow = levelLogic.GetComponent("LevelLogicGameShow");
	//if (levelLogicGameShow == null) Debug.Log("levelLogicGameShow is null!");
	
}

function Update () {

}

function OnMouseDown () {
	
	if (selMode){
		thisCharacterAnimator.SetTrigger("idle");
		otherCharacterAnim.SetTrigger("idle");
		
		//To indicate the LevelLogicGameShow.js script which player has been chosen.
		levelLogicGameShow.PlayerChosen(name);		//Set the player name
		levelLogicGameShow.PlayerSelect();			//To continue with this coroutine where it yielded.
	}
	
}

function OnMouseEnter(){
	if (selMode){
		thisCharacterAnimator.SetTrigger("happy");
		otherCharacterAnim.SetTrigger("disappointed");
	}
}

function OnMouseExit(){
	if (selMode){
		thisCharacterAnimator.SetTrigger("idle");
		otherCharacterAnim.SetTrigger("idle");
	}
}

function SwitchSelMode(on : boolean){
	selMode = on;
}