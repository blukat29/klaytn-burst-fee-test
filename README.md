# BaseFee test

## Setup

### Start a local network

```
./homi setup --cn-num 1 --baobab-test --docker-image-id klaytn/klaytn:v1.9.0-rc.3
cd homi-output
docker-compose up -d
```

### Give money to test account

```
docker-compose exec CN-0 kcn attach klaytn/klay.ipc
klay.sendTransaction({from: personal.listAccounts[0], to: '0xaB36568200B0f2B262107e4E74C68d6E8729Da39', value: 1000e18})
```

### Deploy GasBurner contract

```
export HARDHAT_NETWORK=local
node scripts/deploy.js
```

Then modify `.env` file

```
LOCAL_GASBURNER_ADDR=0x...
```

### Send many transactions

```
node scripts/consume.js
```

### See BaseFee history

```
hh history --start 100 --end 200
```

