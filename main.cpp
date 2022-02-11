/*
	CREDIT FOR DATA:
	File for all english words: https://github.com/dwyl/english-words (words.txt)
	File for all english words and there frequency: https://github.com/hermitdave/FrequencyWords (en_full.txt)
*/

/*
	Program: Primitive Wordle solver. 

	Instructions: 
	1) Access a wordle game online (read instructions online if unsure how to play). 
	2) On BASH terminal type command (./comp.sh)
	3) Enter your guess on wordle, look at the color sequence you get
	4) Enter your guess in the terminal (all caps) followed by a sequence of B/O/G where 
	   B = black, O = Orange / Yellow, and G = Green. You should see word recommendations given
	   Repeat 3 & 4.
	
	5) Enjoy the game :) {Should be self explanatory}

	Logic: Basic idea of combining letter frequency of remaining valid words and commonly used in  
	       english language

	Just a fun idea I had :) 
*/


#include <iostream>
#include <vector>
#include <utility>
#include <ctype.h>
#include <sstream>
#include <algorithm>
#include <cmath>
#include <map>
#include <fstream>
#include <iomanip>
#include <string>

using namespace std;


vector<string>entities;
map<string, int>helper;
map<string, double>prob;
int attempts;
bool answerFound = false;

pair<string, long long> seperator(string s){
	string first, second;
	long long i = 0;
	while(s[i] != 32){
		first += s[i];
		i++;
	}
	i++;
	while(i != s.size()){
		second += s[i];
		i++;
	}
	stringstream g(second);
	long long ans = 0;
	g >> ans;
	return {first, ans};
}

void calculateProbability(){
	int finals = 0;
	ifstream in("freq.txt");
	string d;
	vector<string>token;
	while(getline(in, d, '\n')){
		token.push_back(d);
	}
	
	unsigned long long total = 0;
	for(string a : token){
		bool alpha = false;
		bool length = false;
		auto ir = seperator(a);
		if(ir.first.size() != 5){

		}
		else{
			length = true;
			for(int i = 0; i < ir.first.size(); i++){
				if(!isalpha(ir.first[i])){
					alpha = false;
					break;
				}
				if(i == ir.first.size() - 1){
					alpha = true;
				}				
			}			
		}
		if(length && alpha){
			for(int i = 0; i < ir.first.size(); i++){
				if(!isupper(ir.first[i])){
					ir.first[i] = toupper(ir.first[i]);
				}
			}
			if(helper.find(ir.first) != helper.end()){
				++finals;
				prob[ir.first] = ir.second;
				total += prob[ir.first];
			}
			
		}
		
		
	} 
	auto it = prob.begin();
	while(it != prob.end()){
		it->second = (it->second * 1.0) / total;
		++it;
	}

}

bool isUpper(string s){
	for(char d : s){
		if(isupper(d)){

		}
		else{
			return false;
		}
	}
	return true;
}


void next(){
	map<char, double>freq;
	for(int i = 0; i < entities.size(); i++){
		string s = entities[i];
		if(s[s.size() - 1] != '!'){
			for(char d : s){
				freq[d]++;
			}
		}
	}
	vector<pair<double, string>>remaining;
	for(int i = 0; i < entities.size(); i++){
		string s = entities[i];
		int amount = 0;
		if(s[s.size() - 1] != '!' && isUpper(s)){
			for(char sd : s){
				amount += freq[sd];
			}
			if(prob.find(s) != prob.end()){
				pair<double, string> h = {amount*prob[s], s};
				remaining.push_back(h);
			}
			
		}
	}
	sort(remaining.begin(), remaining.end());
	if(remaining.size() >= 10){
		for(int i = remaining.size() - 1; i >= remaining.size() - 10; i--){
			cout << remaining[i].second << " {" << remaining[i].first << "}" << endl;
			
			
		}
	}
	else{
		for(int i = remaining.size() - 1; i >= 0; i--){
			cout << remaining[i].second << " {" << remaining[i].first << "}" << endl;
			
		}
	}
	cout << endl << endl;
	
}

void readInput(){
	ifstream in("English.txt");
	string s;
	while(in >> s){
		entities.push_back(s);
		helper[s] = 1;
	}
}

void getUserInput(int attempt){
	ofstream out("Help.txt");
	bool errorcheck = true;
	string guess; string bog;
	
	while(errorcheck == true){
		cout << "Enter guess #" << 7-attempt << ": " << endl;
		cin >> guess; 
		if(guess.size() != 5){
			cout << "Guess needs to be 5 in length" << endl;
		}
		else{
			bool passUpper = true;
			for(char d : guess){
				if(!isupper(d)){
					cout << endl << "All uppercase letters please" << endl << endl;;
					passUpper = false;
					break;
				}
			}
			if(passUpper == true){
				errorcheck = false;
			}
			
		}
	}	
	errorcheck = true;
	while(errorcheck){
		cout << "Enter a string consisting of B/O/G" << endl;
		cin >> bog;
		if(bog.size() != 5){
			cout << "BOG string needs to be 5 in length" << endl;
		}
		else{
			bool passChar = true;
			for(char d : bog){
				if(d != 'B' && d != 'O' && d != 'G'){
					cout << "Only enter capital B/O/G please" << endl;
					passChar = false;
					break;
				}
			}
			if(passChar == true){
				errorcheck = false;
			}
		}
	}
	cout << "___________________________________________" << endl;
	for(int i = 0; i < 5; i++){
		for(int j = 0; j < 5; j++){
			if(guess[i] == guess[j]){
				if(bog[i] != bog[j]){
					if(bog[i] == 'B' && bog[j] == 'G'){
						guess[i] = '%';
					}
					else if(bog[i] == 'G' && bog[j] == 'B'){
						guess[j] = '%';
					}
					else if(bog[i] == 'B' && bog[j] == 'O'){
						guess[i] = '%';
					}
					else if(bog[i] == 'O' && bog[j] == 'B'){
						guess[j] = '%';
					}
				}
			}
		}
	}
	for(int i = 0; i < 5; i++){
		char placement = bog[i];
		char character = guess[i];
		if(placement == 'B'){
			// Remove all strings that contain this character
			for(int j = 0; j < entities.size(); j++){
				string consider = entities[j];
				if(consider[consider.size() - 1] != '!' && isalpha(character)){
				for(char d : consider){
					if(d == character){
						entities[j] += "!";
						break;		 				
					}
				}
				}
			}
		}
		else if(placement == 'O'){
			for(int j = 0; j < entities.size(); j++){
				string consider = entities[j];
				
				if(consider[consider.size() - 1] != '!' && isalpha(character)){
					bool contain = false;
					for(int jjj = 0; jjj < 5; jjj++){
						char d = consider[jjj];
						if(d == character && jjj != i){
							contain = true;
						}
					}
					if(!contain){						
						entities[j] += "!";
					}
				}
			}

		}
		else{
			for(int j = 0; j < entities.size(); j++){
				string consider = entities[j];
				if(consider[consider.size() - 1] != '!'){
					if(consider[i] != character && isalpha(character)){
						entities[j] += "!";
					}
				}
			}

		}
	}
	int finals = 0;
	for(string s : entities){
		if(s[s.size() - 1] != '!'){
			++finals;
			// cout << s << endl;
		}
	}
	if(finals == 1){
		string ans;
		for(string s : entities){
			if(s[s.size() - 1] != '!'){
				ans = s;
				break;
			}
		}
		cout << ans << " is the final answer" << endl;
		answerFound = true;
		return;
	}
	else{
		// cout << "******************************" << endl;
		// for(string s : entities){
		// 	if(s[s.size() - 1] != '!'){
		// 		cout << s << endl;
		// 	}
		// }
		cout << finals << " valid words left" << endl;
	}
	
	next();
	
	// logbook.push_back({guess, bog, finals});	
}

int main(){
	cout << fixed << setprecision(16);
	 readInput();
	 
	calculateProbability();
	attempts = 6;
	while(attempts != 0 && answerFound == false){
		getUserInput(attempts);
		attempts--;
	}	
}
