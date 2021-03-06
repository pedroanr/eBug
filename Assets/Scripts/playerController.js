﻿#pragma strict

/*--v--v--v--v--v--v--*--v--v--v--v--v--v--Test variables--v--v--v--v--v--v--*--v--v--v--v--v--v--*/


private var timer: float;
private var debugMode: boolean = false;				//When true, this script displays all the Debug messages.
public var testVar1: float = 0;

/*--v--v--v--v--v--v--*--v--v--v--v--v--v--Variables--v--v--v--v--v--v--*--v--v--v--v--v--v--*/

	//vars to use layerMasks 
//private var groundLayer: int = 12;
//private var playerLayer: int = 9;
//private var nonEnemiesLayer: int = 13;
//private var enemiesLayer: int = 8;
//private var projectilesLayer = 11;
//We'll use the LayerMask to detect just the collisions with the ground objects when deciding where to walk. More info about layerMasks here: http://answers.unity3d.com/questions/8715/how-do-i-use-layermasks.html
//DELETEprivate var groundLayerMask: int = 1 << groundLayer;	//The number of layer for the ground is 12: so the mask will be 0000 0000 0000 0000 0001 0000 0000 0000
//DELETEprivate var groundLayerMask: int = 1 << utils.layers.ground;	//The number of layer for the ground is 12: so the mask will be 0000 0000 0000 0000 0001 0000 0000 0000
//private var bugsLayerMask: int = (1 << utils.layers.enemies) | (1 << utils.layers.nonEnemies);	//Layer mask with two layers activated

public var life: int = 3;
public var soapDrops: int = 5;
public var whiteBloodCells: int = 5;
public var Antibiotics: int = 5;

	//Vars to check if grounded
private var groundHitsNumber: int;
private var groundHits: RaycastHit2D[];
public var groundDistance: float = 1.3;
private var groundDirection: Vector2;
private var grounded: boolean;
private var groundedPreviousValue: boolean = true;

	//Vars to move the player
public var maxSpeed: float = 5;				//maxSpeed of the player
public var jumpForce: int = 700;				//Force applied to the player when Jumping
public var moveForce: float; 			//Force applied to the player when accelerating
private var horizAxis: float; 				//Will take values in this interval [-1, 1] keeping the direction of the horizontal input of the controller (keyboard, joystick..)
private var facingRight: boolean;			//True if the player is facing right, false if not.
private var facingDirection: Vector2;		//Vector2 pointing to the direction where the player is looking at
private var hitDirection: Vector2;			//Contains the direction of the player's hit with something in the world to disable the movement in that direction. Will contain (0, 0)
private var hitDirectionResetTimer: float;	//Timer to reinitialize the hitDirection. hitDirection's x coordinate should be 0 any time the trigger is not colliding with any collider, but it doesn't because OnTriggerExit2D is not working very accurately. We set up this timer to reset to 0 the hitDirection regularly, avoiding it gets stuck in 1 or -1 values.
private var hasBeenRunning: boolean;			//True if the player's speed has been 
private var controlsEnabled: boolean;		//If false, the player won't be able to perform any action, such as walk, jump, shoot any projectile, use antibiotics... It's intended to be turned on while displaying the instructions of the level.

	//Variables of the "take photo" feature
private var photoPoint: Transform;			//To store the point where the photos will be taken from
private var photoLength: int = 3;				//The scope of the photos
private var photoReceivers: RaycastHit2D[]; //To store the colliders which the ray went through
private var flashRenderer: SpriteRenderer;			//Will contain a reference to the flash sprite renderer, to enable or disable it when needed

	//Variables used to shoot soap
private var shootPoint: Transform;
public var dropSoapPrefab: Rigidbody2D;			//Will reference the prefab of the soap. The prefab will have to be dropped here in the inspector.
public var throwForce: float;					//Force with which the soap or the white blood cell will be thrown
public var whiteBCellPrefab: Rigidbody2D;		

	//Other vars
private var myTransform: Transform;			//It's more efficient to keep in variables the components of the gameObject
private var myRigidbody2D: Rigidbody2D;
private var low_anim: Animator;
private var up_anim: Animator;
private var canBeHit: boolean = true;
private var gameLogic: GameLogic;
private var GUIHandler: GUIHandler;


/*--v--v--v--v--v--v--*--v--v--v--v--v--v--Functions--v--v--v--v--v--v--*--v--v--v--v--v--v--*/

function Awake () {

	myTransform = transform;
	low_anim = myTransform.Find("low_player").GetComponent(Animator);
	up_anim = myTransform.Find("up_player").GetComponent(Animator);
	myRigidbody2D = myTransform.rigidbody2D;
	facingRight = true;
	facingDirection = Vector2.right;
	controlsEnabled = true;
	
	groundHits = new RaycastHit2D[3];
	groundDirection = Vector2(0, -1);
	groundedPreviousValue = false;
	hitDirection = Vector2(0, 0);				//To control the movement if the player is hitting any object
	
	photoPoint = myTransform.Find("photo_point").transform;
	photoReceivers = new RaycastHit2D[3];
	flashRenderer = myTransform.Find("flash").GetComponent(SpriteRenderer);
	flashRenderer.enabled = false;
	
	var gameLogicGO : GameObject;
	gameLogicGO = GameObject.Find("GameLogic");
	if (gameLogicGO){
		gameLogic = gameLogicGO.GetComponent("GameLogic");					//BE CAREFUL!! GameLogic is a GameObject that is created in the first scene and is never destroyed when changing between scenes!
																			//That means that if this scene is played directly there will be here a null reference!!!!!!!
	}																				
	else{
		Debug.LogError("GameLogic Object not found. This will be because GameLogic is created in the first level of the game, the GameShow level, and is intended to pass (be kept alive) throughout all the scenes in the game. So, if the Kitchen level is played, this object won't exist, and there must be many Null reference errors. But none of this errors will avoid playing the game. ");
	}
	
	shootPoint = myTransform.Find("shoot_point").transform;
	
	canBeHit = true;
	
	/*vvvvvvvvv GUI part vvvvv*/
//	GUITextPlayerInfo.SetInfoPlayer(life, soapDrops, Antibiotics, whiteBloodCells);			//Debugging GUI. Delete when the new one is working
	
	var GUIHandlerGO : GameObject;
	GUIHandlerGO = GameObject.Find("GUI(Clone)").gameObject;
	if (!GUIHandlerGO) Debug.LogError("There was a problem when trying to find the GUI GameObject, that should contain the GUIHandler script.");
	else {
		//Debug.Log("GUIHandler found. Comment this log if this feature is working");
		GUIHandler = GUIHandlerGO.GetComponent("GUIHandler");
		//Debug.Log("GUIHandler found. Ready to use.");
		GUIHandler.UpdateGUI(life, soapDrops, whiteBloodCells, Antibiotics);
	}
	/*^^^^^^^^^ GUI part ^^^^^*/
	
}

function Start () {
	
	//Just for testing
	//Physics2D.IgnoreLayerCollision(utils.layers.player, utils.layers.projectiles, true);
	
}

function Update () {

	low_anim.ResetTrigger("jump_end");					//Usually, this trigger got stuck to true (unexplicably). This line fixes it. NOTE: If you send two "jump_end" signals to the animator, this trigger will contain true after playing the animation the first time.
	
	//showMessages();
	
	/*--v--v--v--v--v--v--Code to jump--v--v--v--v--v--v--*/
	
	//static function DrawRay(start: Vector3, dir: Vector3, color: Color = Color.white, duration: float = 0.0f, depthTest: bool = true): void;
	
	
	Debug.DrawRay(myTransform.position, groundDirection*groundDistance, Color.black, 0);
	Debug.DrawRay(Vector3(myTransform.position.x + 0.3, myTransform.position.y, 0), groundDirection*groundDistance, Color.green, 0);
	Debug.DrawRay(Vector3(myTransform.position.x - 0.3, myTransform.position.y, 0), groundDirection*groundDistance, Color.green, 0);
	
	//static function RaycastNonAlloc(origin: Vector2, direction: Vector2, results: RaycastHit2D[], distance: float = Mathf.Infinity, layerMask: int = DefaultRaycastLayers, minDepth: float = -Mathf.Infinity, maxDepth: float = Mathf.Infinity): int;
	
	groundHitsNumber = Physics2D.RaycastNonAlloc(myTransform.position, groundDirection, groundHits, groundDistance, utils.layerMasks.groundAndBugs);
	groundHitsNumber += Physics2D.RaycastNonAlloc(Vector3(myTransform.position.x + 0.3, myTransform.position.y, 0), groundDirection, groundHits, groundDistance, utils.layerMasks.groundAndBugs);
	groundHitsNumber += Physics2D.RaycastNonAlloc(Vector3(myTransform.position.x - 0.3, myTransform.position.y, 0), groundDirection, groundHits, groundDistance, utils.layerMasks.groundAndBugs);
	
	//Debug.DrawLine(myTransform.position, groundPoint, Color.red, 0, false);
	//groundHitsNumber = Physics2D.LinecastNonAlloc(myTransform.position, groundDirection, groundHits, groundLayerMask);
	if (groundHitsNumber == 0){ 
		grounded = false;
		if (debugMode) Debug.Log("Not grounded");
	}
	else{
		grounded = true;
		if (debugMode) Debug.Log("Grounded");
	}
	
	if (!groundedPreviousValue && grounded){
		low_anim.SetTrigger("jump_end");
		//Debug.Log("Landed!");
	}
	groundedPreviousValue = grounded;
	
	if(controlsEnabled){
		if (grounded && Input.GetButtonDown("Jump")){
			myRigidbody2D.AddForce(new Vector2(0, jumpForce));		// Add a vertical force to the player.
			low_anim.SetTrigger("jump_start");
		}
		
		/*--v--v--v--v--v--v--Code to control other buttons--v--v--v--v--v--v--*/
		
		if (Input.GetButtonDown("Fire1")){	//Should be left ctrl
			//Fire 1 button should be the left control button. It's used to take photos and, if there is antibiotics available, drop them instead
//			takePhoto();
			if(Antibiotics > 0) useAntibiotics();
			else takePhoto();
		}
		
		if (Input.GetButtonDown("Fire2")){
			//Fire2 button is supposed to be the space bar. It will throw soap drops if available and if there is any white blood cells they will be dropped instead.
//			shootSoap();
			if (whiteBloodCells <= 0) {
				shootSoap();
			}else{
				shootWBC();
			}
		}
		
//		if (Input.GetButtonDown("Fire3")){
//			shootWBC();
//		}
//		
//		if (Input.GetKeyDown(KeyCode.Z)){
//			//Debug.Log("'Z' button pressed. Using Antibiotics (if any).");
//			useAntibiotics();
//		}
		
		horizAxis = Input.GetAxisRaw("Horizontal");				//Cache the horizontal input. All the Input Calls must be done in the Update function. 
	}//controlsEnabled's if
	else{
		horizAxis= 0;
	}
}

function FixedUpdate () {
	
	
	/*--v--v--v--v--v--v--Code to move--v--v--v--v--v--v--*/
	
	
	/*vvvvTESTvvvv*/

	/*^^^^TEST^^^^*/
	
	/**/
//	hitDirectionResetTimer += Time.deltaTime;
//	if (grounded && hitDirectionResetTimer > 0.25){						//To reset the hitDirection every 0.35 secs to avoid it from getting stuck when OnTriggerExit fails (it does fail).
//		hitDirectionResetTimer = 0;
//		hitDirection.x = 0;
//	}
//	
//	
//	/**/
//	if(hitDirection.x != 0 && Mathf.Sign(horizAxis) == Mathf.Sign(hitDirection.x)){ 			//To stop the player applying forces against some object if they are colliding
//		horizAxis = 0;
//	}
	
	
	low_anim.SetFloat("speed", Mathf.Abs(horizAxis));
	up_anim.SetFloat("speed", Mathf.Abs(horizAxis));
	
	/*vvvvvvvvvvvvvvvvvvvvv part of the code using forces  vvvvvvvvvvvvvvvvvvvvv*/
	
	if(Mathf.Abs(myRigidbody2D.velocity.x) > 0.6 ){
		if (horizAxis * myRigidbody2D.velocity.x >= maxSpeed){
			myRigidbody2D.velocity = Vector2(Mathf.Sign(myRigidbody2D.velocity.x) * maxSpeed, myRigidbody2D.velocity.y);	// ... set the player's velocity to the maxSpeed in the x axis.
		}
		else{						// If the player is changing direction (h has a different sign to velocity.x) or hasn't reached maxSpeed yet...
			myRigidbody2D.AddForce(Vector2.right * horizAxis * moveForce);				// ... add a force to the player.
		}
	}
	else{
		if(horizAxis * myRigidbody2D.velocity.x < maxSpeed)
			myRigidbody2D.AddForce(Vector2.right * horizAxis * moveForce);				// ... add a force to the player.
	}
	
	/*^^^^^^^^^^^^^^^^^^^^^ part of the code using velocity  ^^^^^^^^^^^^^^^^^^^^^*/
	
	/*it works!!!*/
	/**/
	//Idea: check if it's colliding with something before aplying this force to the body
//	myRigidbody2D.velocity.x = horizAxis * maxSpeed;
	/**/
	/*^^^^^^^^^^^^^^^^^^^^^ part of the code using velocity  ^^^^^^^^^^^^^^^^^^^^^*/
	
	if(myRigidbody2D.velocity.x > 0.15 && !facingRight)							// If the input is moving the player right and the player is facing left...
		Flip();																	// ... flip the player.
	else if(myRigidbody2D.velocity.x < -0.15 && facingRight)					// Otherwise if the input is moving the player left and the player is facing right...
		Flip();																	//Note that there is a little margin of 0,2 to avoid it from flipping very fast. This margin should be tested an adjusted if is not well set.
	
}


//To control the collisions with the enemies and substract life when this happens
function OnCollisionEnter2D (coll: Collision2D) {
		if (canBeHit && coll.collider.gameObject.layer == utils.layers.enemies){
			//Debug.Log("Layer collided: " + coll.collider.gameObject.layer + ". Enemies layer: " + utils.layers.enemies);
			beHit();
		}
}

private function beHit(){
	
	canBeHit = false;
	
	low_anim.SetTrigger("hurt");
	up_anim.SetTrigger("hurt");
	
	life --;
	UpdateGUI();
	Debug.Log("Player was hurt. Lifes remaining: " + life);
	
	if (life <= 0){
		/*Do something when dead!!*/
		Debug.Log("Player has dead!!");
		
		if (gameLogic.checkConnection()){			//If we are authenticated in the web service
			var firstTrack: JSONObject = new JSONObject();	//Sending the track to the database..
			firstTrack.Add("type", "logic");
			firstTrack.Add("event", "Player has died");
			firstTrack.Add("level", gameLogic.GetLevelName());
			var tracks : JSONObject[] = new JSONObject[1];
			tracks[0] = firstTrack;
			gameLogic.db.Track(tracks);
		}
		else{
			Debug.Log("Connection not established (sessionKey not found) when trying to post the first trace.");
		}
		
		gameLogic.RestartLevel();
	}
	
	yield new WaitForSeconds(2);				
	canBeHit = true;
	
}	

public function AddPickups(soap: int, whitebc: int, antibiotics: int){
	
	soapDrops += soap;
	whiteBloodCells += whitebc;
	Antibiotics += antibiotics;
	UpdateGUI();
	
}

//Sets the amount of pickups to the numbers passed by parameter
public function SetPickups(soap: int, whitebc: int, antibiotics: int){
	
	soapDrops = soap;
	whiteBloodCells = whitebc;
	Antibiotics = antibiotics;
	UpdateGUI();
	
}

public function AddSoap(soap: int){
	soapDrops += soap;
	UpdateGUI();
}

public function AddWhiteBloodCells(whitebc: int){
	whiteBloodCells += whitebc;
	UpdateGUI();
}

public function AddAntibiotics(antibiotics: int){
	if (Antibiotics == 0) Antibiotics += antibiotics;
	UpdateGUI();
}

//To shoot soap
function shootSoap() {
	if(soapDrops > 0){
		soapDrops--;
		UpdateGUI();
		
		up_anim.SetTrigger("shoot_soap");
		yield new WaitForSeconds(0.2);
		var dropSoap: Rigidbody2D = Instantiate(dropSoapPrefab, shootPoint.position, myTransform.rotation);
		if(!facingRight){
			var dropScale: Vector3 = dropSoap.transform.localScale;				//Multiply the player's x local scale by -1.
			dropScale.x *= -1;
			dropSoap.transform.localScale = dropScale;
		}
		dropSoap.AddForce(facingDirection * throwForce);
	}
	else{
		Debug.Log("Not enough soap");
	}
}

//To shoot white blood cells
function shootWBC () {
	if(whiteBloodCells > 0){
		whiteBloodCells--;
		UpdateGUI();
		
		up_anim.SetTrigger("throw_whiteb_cell");
		yield new WaitForSeconds(0.2);
		var whiteBCell: Rigidbody2D = Instantiate(whiteBCellPrefab, shootPoint.position, myTransform.rotation);
		/*if(!facingRight){
			var dropScale: Vector3 = dropSoap.localScale;				//Multiply the player's x local scale by -1.
			dropScale.x *= -1;
			dropSoap.localScale = dropScale;
		}*/
		whiteBCell.AddForce(facingDirection * throwForce);
	}
	else{
		Debug.Log("Not enough white blood cells");
	}
}

//To shoot antibiotics
function useAntibiotics () {
	if(Antibiotics > 0){
		Antibiotics--;
		UpdateGUI();
		CameraShake.AntibioticShake();
		
		var enemiesArray: GameObject[] = GameObject.FindGameObjectsWithTag("Enemy");
		var nonEnemiesArray: GameObject[] = GameObject.FindGameObjectsWithTag("NonEnemy");
		//Debug.Log("useAntibiotics(): Enemies detected: " + enemiesArray.length + ". Non enemies detected: " + nonEnemiesArray.length);
		
		for(var enemy: GameObject in enemiesArray){
			enemy.SendMessage("receiveAntibiotics");
			Debug.Log("useAntibiotics(): Message sent to: " + enemy.name);
		}
		for(var nonEnemy: GameObject in nonEnemiesArray){
			nonEnemy.SendMessage("receiveAntibiotics");
			Debug.Log("useAntibiotics(): Message sent to: " + nonEnemy.name);
		}
	}
	else{
		Debug.Log("Not enough antibiotics");
	}
}

public function UpdateGUI () {
	
	//GUITextPlayerInfo.SetInfoPlayer(life, soapDrops, whiteBloodCells, Antibiotics);
	//Debug.Log("Trying to use GUIHandler...");
	GUIHandler.UpdateGUI(life, soapDrops, whiteBloodCells, Antibiotics);
}


//function OnTriggerEnter2D (hit: Collider2D) {
//	
//	var hitGameObject: GameObject = hit.gameObject;
//	//Debug.Log("Collision with object in Layer: " + hitGameObject.layer);
//	if(	hitGameObject.layer == utils.layers.ground || 
//		hitGameObject.layer == utils.layers.enemies || 
//		hitGameObject.layer == utils.layers.nonEnemies){
//		
//		if(facingRight)
//			hitDirection = Vector2(1, 0);
//		else 
//			hitDirection = Vector2(-1, 0);
////		Debug.Log("Collision direction: " + hitDirection + "Object layer: " + hitGameObject.layer + ". Name: " + hitGameObject.name);
//	}
//}
//
//function OnTriggerExit2D(hit: Collider2D){
//
//	hitDirection = Vector2(0, 0);
////	Debug.Log("Collision exit. Name: " + hit.gameObject.name);
//
//}


//Plays the take photo animation and trigger this animation on any bug that is in the photo trayectory.
private function takePhoto () {

	Debug.DrawRay(photoPoint.position, facingDirection*photoLength, Color.red, 1);
	up_anim.SetTrigger("take_photo");
	var receivers: int = Physics2D.RaycastNonAlloc(photoPoint.position, facingDirection, photoReceivers, photoLength, utils.layerMasks.bugs);
	for (var i: int = 0; i < receivers; i++) {
		photoReceivers[i].transform.SendMessage("bePhotographed");
	}
	
	yield new WaitForSeconds(0.3);
	flashRenderer.enabled = true;
	yield new WaitForSeconds(0.2);
	flashRenderer.enabled = false;
	
}

private function Flip () {

	facingRight = !facingRight;
	facingDirection = facingDirection * (-1);
	
	var bugScale: Vector3 = myTransform.localScale;				//Multiply the player's x local scale by -1.
	bugScale.x *= -1;
	myTransform.localScale = bugScale;

}

public function EnableControls(){
	//Enable the movements of the player
	controlsEnabled = true;
}

public function DisableControls(){
	//Disable the movements of the player. Useful to show the information about the goals of each level
	controlsEnabled = false;
}

//This function triggers the debugMode to true during 1 frame each second. It is intended to show one frame per second the Debug messages. Use this way:
//if (debugMode) Debug.log("Your message");
/*private function showMessages(){
	timer += Time.deltaTime;
	debugMode = false;
	if (timer > 1){
		debugMode = true;
		timer = 0;
	}	
}*/