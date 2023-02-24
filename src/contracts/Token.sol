// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Token {
 //Variables
 string public name = "DFT Battle Coin";
 string public symbol = "DFTBC";
 uint256 public decimals = 18;
 uint256 public  totalSupply;
 
 //Event
 event Transfer(address indexed _from, address indexed _to, uint256 _value);
 event Approval(address indexed _owner, address indexed _spender, uint256 _value);

 //track balances
 mapping(address => uint256) public balanceOf;
 mapping(address => mapping(address => uint256)) public allowance;

 // Supply of existing tokens
 constructor(){
    totalSupply = 1000000 *( 10 ** decimals); 
    balanceOf[msg.sender] = totalSupply;
   }

//send tokens
 function transfer(address _to, uint256 _value) public returns (bool success){
      require(balanceOf[msg.sender] >= _value);
      _transfer(msg.sender, _to, _value);
      return true;
   }


 function _transfer(address _from, address _to, uint256 _value) internal {
      require(_to != address(0));
      balanceOf[_from] = balanceOf[_from]-(_value);
      balanceOf[_to] = balanceOf[_to] + _value;
      emit Transfer(_from, _to, _value);
   }


//approve tokens
 function approve(address _spender, uint256 _value) public returns (bool success){
      require(_spender != address(0));
      allowance[msg.sender][_spender] = _value;
      emit Approval(msg.sender, _spender, _value);
      return true;
   }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
     require(_value <= balanceOf[_from]);
     require(_value <= allowance[_from][msg.sender]);
     allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;
      _transfer(_from, _to, _value);
      return true;
   }

} 


