# Multipassport app
User interface for Upala protocol. Multipassport shows all available scores and delegates of a user. Provides explosion functionality.

#### Interaction and references:

- Uses [deployments](https://github.com/upala-digital-identity/deployments) for contracts ABIs and addresses.
- Queries contract data from [Upala subgraph](https://github.com/upala-digital-identity/subgraph-schema).
- Queries individual scores and their proofs from [DB](https://github.com/upala-digital-identity/db).
- Manages user on-chain through [Upala protocol](https://github.com/upala-digital-identity/upala/tree/master/contracts/protocol).
- Explodes user through [Upala groups](https://github.com/upala-digital-identity/upala/tree/master/contracts/pools).
- Uses metadata scheme from [Upala groups](https://github.com/upala-digital-identity/upala/tree/master/contracts/pools).

## Dashboard

#### Populating dashboard (and "more..." button)
- connect to Ethereum wallet (e.g. Metamask) and retrieve user address.
- querry Graph to get user id (Graph: "Get user UpalaID by address")
- if no id, switch to "create id" screen
- if there's an id, querry delegates (Graph: "Get owner and delegates for the Upala ID")
- get 10 best scores for the user from DB (check [here](https://github.com/upala-digital-identity/db))
- querry graph for group metadata (Graph "Get group metadata by address") and extract **title** for each group. See metaData structure in the [pool contract](https://github.com/upala-digital-identity/upala/blob/master/contracts/pools/simple-verification-pool.sol). 
- if user clicks **"more..."** load next 10 best scores (11..20, 21..30, etc.)

#### "Approve new" (delegate) button
- check validity of the provided address
- call **approveDelegate(address delegate)** with the provided address as **delegate**
- show error if there's one from the contract. 

#### "Remove" (delegate) button
- call **removeDelegate(address delegate)** with the provided address as **delegate**
- show error if there's one from the contract. 

#### "Change owner" button
- call **setIdentityOwner(address newIdentityOwner)** with the provided address as **newIdentityOwner**
- show error if there's one from the contract. 

## Create ID

#### "Create ID" button
- call **newIdentity(address newIdentityOwner)** function of Upala protocol. Use user address as **newIdentityOwner**
- show error if there's one from the contract.

## Group details

#### Populating group details screen
- extract **url** from group metadata (load metadata if not yet loaded - see Populating dashboard section). If there's one show **"Visit"** button.
- extract **joinLink** from group metadata (load metadata if not yet loaded - see Populating dashboard section). If there's one show **"Join"** button.
- querry score if needed (see Populating dashboard section)

## Explosions

#### Populating Explode screen
- querry Graph for score if needed (see Populating dashboard section)
- querry proof from db (see GET request [here](https://github.com/upala-digital-identity/db))

#### "Explode" button 
(after all precautions of the interface were passed - see [figma prototype](https://www.figma.com/file/L55604m75wk8Snl7PYlrwg/Multipassport-app?node-id=0%3A1) for the workflow)
- select ABI depending on **poolType** (from **deployments**)
- call attack function with proper arguments. E.g. **attack(address identityID, uint8 score, bytes calldata signature)** for **SignedScoresPool**