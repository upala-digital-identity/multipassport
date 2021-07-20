# Multipassport app
User interface for Upala protocol. 

## Populating multipassport dashboard

Multipassport shows all available scores and delegates of a user. 

1. On user login (connecting Metamask) Multipassport queries Upala to get user Upala ID and all approved address (Using graph)
2. Then queries DB to get all scores for the user.

## Creating Upala ID

If user ID cannot be found when populating dashboard, the multipassport app invites to create an account.

## Exploding

1. When user heads to explode section of a particular group, multipassport requests score proof for that group.
2. User sends explosion transaction to Upala.
