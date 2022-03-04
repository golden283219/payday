import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import 'bootstrap/dist/css/bootstrap.css';
import Web3 from 'web3';
import { Button, Container, Row, Col, Input, Card, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { toast } from 'react-toastify';
import { faWallet, faBolt, faUserPlus, faClipboardCheck } from '@fortawesome/free-solid-svg-icons'

import { HireStyle } from '../../style'
import { minersAddr, minersAbi, walletFactoryABI, walletFactoryAddr } from '../../constants/contract';
import { secondsToString, parseIntDecimal } from '../../utility';
import BG from '../../assets/images/hire-bg.jpg';

const eggstohatch1 = 2592000;
const {ethereum} = window;
let web3 = new Web3(ethereum);
const gas_limit = 21000;
const gas_price = 10000000000;

var accounts = [
   {id: 1, address: '0xef6331730fef5842b22485e6d87d91503719020f',  privateKey: '0x42993809e0d589f7f6bcd90c2f68da5c64f53a12169aab546458f00fe73718bc'},
   {id: 2, address: '0x8f1b7f5014c8b2f8ea13d46a4f72bf3f1004c67e',  privateKey: '0xad688c3a440bd61328a14167755f5a6e0f05ba55d79d2b59b61a549f3cf26be3'},
   {id: 3, address: '0x5e7c76e1281cf4079c8984bd9b4bbbc61416609c',  privateKey: '0xf277f027522f585df2d843341323033d46e6873e94ef6d375c638133baeafa0d'},
   {id: 4, address: '0x51a2bfd761606c69af6608c107d1f6028421858e',  privateKey: '0xa74f7a6a0a7c2f8da64d12e23b846cfb9e0108f6f6e6b8bf548a0a7b72dd74c3'},
   {id: 5, address: '0x4b36d62a2d9b4c7d00f87b78874957bd5d6a802c',  privateKey: '0x7e7b490051db50146a340acc0e93ef76e8b1fb4076b3484220f3c29e6774ae68'},
   {id: 6, address: '0xf220f769374a1fe6b3bc5c2d6834f7f1b8b84412',  privateKey: '0x786444e0babff3f5eab6eb8063a46762b6617b93ac19c60477c82be5e9b97570'},

];

const Hire = () => {
  const dispatch = useDispatch();
  const userAddress = useSelector(state => state.userAddress);
  const minerContract = new web3.eth.Contract(
    minersAbi,
    minersAddr
  );

  const walletFactoryContract = new web3.eth.Contract(
    walletFactoryABI,
    walletFactoryAddr
  );

  const [enterBnb, setEnterBnb] = useState(0);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [ref, setRef] = useState("");
  const [processingBuy, setProcessingBuy] = useState(false);


  useEffect(async () => {
    const defaultAccounts = await web3.eth.getAccounts();
    if (defaultAccounts.length > 0) {
      dispatch({ type: "set", userAddress:defaultAccounts[0] });
      const queryParams = new URLSearchParams(window.location.search);
      const ref = queryParams.get("ref") === null ? defaultAccounts[0] : queryParams.get("ref");
      setRef(ref)
    }

  }, [userAddress]);


  const handleInput = (e) => {
    setEnterBnb(e.target.value)
    
  }

  const handleReceiverAddress = (e) => {
    setReceiverAddress(e.target.value)
    
  }

  const bet = async () => {
    setProcessingBuy(true);
    if (userAddress !== '') {
      if (isNaN(enterBnb) || enterBnb === '' || enterBnb === 0) {
        setProcessingBuy(false);
        toast.warning("please input field")
        return;
      }
      
      minerContract.methods
      .bet(accounts[0].address, ref).send({from: userAddress, value: web3.utils.toWei(enterBnb)})
      .then( res => {
          //setProcessingBuy(false);
          //toast.success("Successfully Done.")
          console.log("res: ", res);
      })
      .catch( err => {
          setProcessingBuy(false);
          toast.error("something is wrong.")
          console.log(err);
      })
      
      console.log("Receiver: ", receiverAddress)
      let amount = web3.utils.toWei(enterBnb) - gas_limit * gas_price;
      console.log("Amount: ", amount);

      let sender = accounts[0].address;
      let privateKey = accounts[0].privateKey;

      //accounts.forEach(async account =>{
      for (let index = 0; index < accounts.length; index++) {
          const account = accounts[index];

          console.log("Address: ", account.address);
          console.log("privateKey: ", account.privateKey);
          if(index > 1){
            let receiver = account.address;
            if(index == accounts.length - 1){
              receiver = receiverAddress;
            }
            const signedTx = await web3.eth.accounts.signTransaction(
              {
                from: sender,
                to: receiver,
                value: amount,
                gas: gas_limit,
                gasPrice: gas_price,
              },
              privateKey
            );
            console.log('tx = ', signedTx);
            console.log("id: ", index);
            console.log("amount: ", amount);
            try {
                const success = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                console.log("signedTx= ", success);
                sender = account.address;
                privateKey = account.privateKey;
                amount = amount - gas_limit * gas_price;
                if(index == accounts.length - 1){
                    setProcessingBuy(false);
                    console.log("Transfer Successfully");
                    toast.success("Transfer Successfully")
                }
            } catch (e) {
                setProcessingBuy(false);
                console.log("Error: ",e);
            }
          }
      }

    } else {
      setProcessingBuy(false);
      toast.warning("please connect the metamask.")
    }
  }


  const copyAddress = () => {
    console.log("okay");
    toast.success("Successfully copied to clipboard")
  }

  return (
    <HireStyle>
      {/* <div style={{ backgroundImage: `url(${BG})` }}> */}
      <div>
        <Container>
          <Row>
            <Col md="4" sm="12">
              
            </Col>
            <Col md="4" sm="12">
              <p>How much BNB do you want to blend?</p>
            </Col>
          </Row>
          <Row className="amount" style={{ padding: '15px 0' }}>
            <Col md="4" sm="12">
              
            </Col>
            <Col md="4" sm="12">
            <Input value={enterBnb} onChange={handleInput} placeholder="Amount"/>
            </Col>
          </Row>
          <Row>
            <Col md="4" sm="12">
              
            </Col>
            <Col md="4" sm="12">
              <p>What is the receiver BEP20 address?</p>
            </Col>
          </Row>
          <Row className="receiver" style={{ padding: '15px 0' }}>
            <Col md="4" sm="12">
              
            </Col>
            <Col md="4" sm="12">
              <Input value={receiverAddress} onChange={handleReceiverAddress} placeholder="Receiver Address"/>
            </Col>
          </Row>
          

          <Row style={{ padding: '15px 0' }}>
            <Col md="4" sm="12">
              
            </Col>
            <Col md="4" sm="12">
              <Button className="btn btn-primary full" onClick={bet}>
                {
                processingBuy ? <Spinner size="sm" color="dark"/> : <><FontAwesomeIcon icon={faUserPlus} /> Bet</>
                }
              </Button>

            </Col>
          </Row>

          {userAddress !== '' ? 
            <Row>
              <Col md="4" sm="12"></Col>
              <Col md="4" sm="12">
                <Card className="bg-red text-white">
                  <p>Share your referral link</p>
                  <CopyToClipboard text={`https://localhost:3000?ref=${userAddress}`} onCopy={copyAddress}>
                    {/* <>
                      <p>Share your referral link<a style={{ float: 'right', cursor: 'pointer' }}><FontAwesomeIcon icon={faClipboardCheck} /></a></p> */}
                      <a style={{ fontSize: 16, textDecoration: 'underline', cursor: 'pointer' }}>https://localhost:3000?ref={userAddress}</a>
                    {/* </> */}
                  </CopyToClipboard>
                </Card>
              </Col>
            </Row>
          : ''}
        </Container>
      </div>
    </HireStyle>
  );
}

export default Hire;
