﻿#pragma strict
public static class en_en_gameshow_round3{
	private var dialogue: String = "<?xml version='1.0' encoding='utf-8' ?><round id='0'>	<name>Good Microbes</name>	<round_id>2</round_id>	<next_round>en_en_gameshow_round4.xml</next_round>	<intro_text>		<blind>			<statement>Welcome to the THIRD round</statement>			<statement>What do you know about USEFUL microbes?</statement>			<statment>Let's Go!</statment>		</blind>		<normal>			<statement>Now let's see what you have learned.</statement>			<statement>Remember, 10 points for a correct answer, but if you get it wrong, the other player gets the points.</statement>			<statement>so if you DON'T KNOW the answer, it's best to play it safe and say so!</statement>			<statement>Ready?</statement>			<statement>Let's Go!</statement>		</normal>	</intro_text>	<questions>		<question id='0'>			<type>0</type>			<score>10</score>			<value>1</value>			<text>We use useful microbes to make things like bread and yogurt</text>			<answers>				<answer>					<label>Agree</label>					<value>1</value>				</answer>				<answer>					<label>Don't Know</label>					<value>0</value>				</answer>				<answer>					<lable>Disagree</lable>					<value>-1</value>				</answer>			</answers>		</question>		<question id='1'>			<type>0</type>			<score>10</score>			<value>1</value>			<text>All microbes are harmful for us</text>			<answers>				<answer>					<label>Agree</label>					<value>-1</value>				</answer>				<answer>					<label>Don't Know</label>					<value>0</value>				</answer>				<answer>					<label>Disagree</label>					<value>1</value>				</answer>			</answers>		</question>		</questions></round>		";
	public static function GetRoundText(){
		Debug.Log('en_en_gameshow_round1: Serving the string...');
		return dialogue;
	}
}