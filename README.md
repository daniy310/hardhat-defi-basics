 # 🤖 Hardhat Defi Basics

## 1. Depositing collateral:
 - Getting some WETH,
 - Getting the LendingPool's address,
 - Approving it to be spent by the LendingPool,
 - Actually depositing the WETH in the LendingPool.
 
## 2. Borrowing another asset: DAI
 - Getting the BorrowUserData,
 - Getting the amount of DAI that we can borrow,
 - Borrowing 95% of our allowed sum of borrowing,
 - Getting the BorrowUserData again to compare the results.

## 3. Repaying the DAI
 - Approving the token to be spent by the LendingPool,
 - Actually repaying the DAI to the LendingPool.
