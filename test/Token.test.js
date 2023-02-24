const Token = artifacts.require('./Token');
import {tokens, EVM_REVERT} from './helpers'

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token', ([deployer, sender, receiver, exchange])=>{ 
    const name = 'DFT Battle Coin'
    const symbol = 'DFTBC'
    const decimals = '18'
    const totalSupply = tokens(1000000).toString()
    let token

    beforeEach(async ()=> {
        token = await Token.new()
    })

    describe('deployment', ()=> {
        it('track the name', async()=> {
            const result = await token.name()
            result.should.equal(name)
        })

        it('track the symbol', async ()=> {
            const result = await token.symbol()
            result.should.equal(symbol)
        })

        it('track the decimals', async ()=> {
            const result = await token.decimals()
            result.toString().should.equal(decimals)
        })

        it('track thhe total supply', async ()=> {
            const result = await token.totalSupply()
            result.toString().should.equal(totalSupply.toString())
        })

        it('assign the total supply to the deployer', async ()=> {
            const result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply.toString())
        })
    })

    describe('sending token', ()=> {
        let result
        let amount

        beforeEach(async ()=> {
            amount = tokens(100)
            result = await token.approve(exchange, amount, {from: deployer} )
         })
    
        describe('success', async ()=> {
            beforeEach(async ()=> {
                result = await token.transferFrom(deployer, receiver, amount, {from: exchange} )
            })
    
            it('transfers token balance', async ()=>{
                let balanceOf 
                //Transfer
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(999900).toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(tokens(100).toString())
            })

            it('resets the allowance', async ()=> {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal('0')
            })

            it('emit a transfer event', async() => {
               const log = result.logs[0]
               log.event.should.eq('Transfer')
               const event = log.args
               event._from.toString().should.equal(deployer, 'from is correct')
               event._to.should.equal(receiver, 'to is correct')
               event._value.toString().should.equal(amount.toString(), 'value is correct')
            })
    
        })
        describe('failure', async ()=> {
            
             it('rejects insufficient balances', async ()=>{
               let invalidAmount 
               invalidAmount = tokens(100000000)
               await token.transfer(receiver, invalidAmount, {from: deployer}).should.be.rejectedWith( EVM_REVERT );
               
              invalidAmount = tokens(10)
              await token.transfer(receiver, invalidAmount, {from: receiver}).should.be.rejectedWith( EVM_REVERT );
           })

            it('rejects invalid recepients', async ()=> {
        
                await token.transfer(0x0, amount, {from: deployer}).should.be.rejected
           })
        })

        describe('delegated tokens transfers', ()=> {
            let result 
            let amount

            beforeEach(async ()=> {
                amount = tokens(100)
                result = await token.approve(exchange, amount, {from: deployer} )
            })
        })
        describe('success', ()=> {
            it('allocates an allowance for delegated taken spending on exchnage', async ()=> {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal(amount.toString())
            })

            it('emit a approval event', async() => {
                const log = result.logs[0]
                log.event.should.eq('Approval')
                const event = log.args
                event._owner.toString().should.equal(deployer, 'owner is correct')
                event._spender.should.equal(exchange, 'spender is correct')
                event._value.toString().should.equal(amount.toString(), 'value is correct')
             })
        })

        describe('failure', ()=> {
            it('rejects invalid spenders', async() =>{
                await token.approve(0x0, amount, {from: deployer}).should.be.rejected
            })
        
            it('rejects insufficient balances', async ()=>{
                const invalidAmount = tokens(100000000)
                await token.transferFrom(deployer, receiver, invalidAmount, {from: exchange}).should.be.rejectedWith( EVM_REVERT );
                })
            })
            describe('failure', async ()=> {
            it('rejects invalid recepients', async ()=> {
                await token.transferFrom(deployer,0x0, amount, {from: exchange}).should.be.rejected
            }) 
        })
    })  
})