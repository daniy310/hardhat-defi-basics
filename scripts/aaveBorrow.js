const { getWeth, AMOUNT } = require("../scripts/getWeth");
const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  await getWeth();
  const { deployer } = await getNamedAccounts();

  //Lending Pool Address Provider : 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
  const lendingPool = await getLendingPool(deployer);
  console.log(`LendingPool address : ${lendingPool.address}`);

  //APPROVE
  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  await approveERC20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);

  //DEPOSITING
  console.log("Depositing...");
  const depositTx = await lendingPool.deposit(
    wethTokenAddress,
    AMOUNT,
    deployer,
    0
  ); //0 is the refferal code (it got discontinued)
  await depositTx.wait(1);
  console.log("Deposited !");

  //BORROWING
  //get account details
  let { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(
    lendingPool,
    deployer
  );
  //get the conversion of availableBorrowsETH in DAI
  const daiPrice = await getDaiPrice();
  const amountDaiToBorrow =
    availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
  const amountDaiToBorrowInWei = ethers.utils.parseEther(
    amountDaiToBorrow.toString()
  );

  console.log(`You can borrow ${amountDaiToBorrow} DAI`);
  const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  await borrowDai(
    daiTokenAddress,
    lendingPool,
    amountDaiToBorrowInWei,
    deployer
  );

  await getBorrowUserData(lendingPool, deployer);

  //REPAYING
  await repay(amountDaiToBorrowInWei, daiAddress, lendingPool, deployer);
}

async function repay(amount, daiAddress, lendingPool, account) {
  await approveERC20(daiAddress, lendingPool.address, amount, acount);
  const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
  await repayTx.wait(1);
  console.log("Repaid !");
}

async function borrowDai(
  daiAddress,
  lendingPool,
  amountDaiToBorrowInWei,
  account
) {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    amountDaiToBorrowInWei,
    1,
    0,
    account
  );
  await borrowTx.wait(1);
  console.log("You have borrowed !");
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );
  const price = (await daiEthPriceFeed.latestRoundData()).answer;
  console.log(`The DAI/ETH price is ${price.toString()}`);
  return price;
}

async function getBorrowUserData(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);
  console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
  console.log(`You have ${totalDebtETH} worth of ETH borrowed`);
  console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);

  return { totalDebtETH, availableBorrowsETH };
}

async function approveERC20(
  erc20Address,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt(
    "IERC20",
    erc20Address,
    account
  );

  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);

  console.log("Approved !");
}

async function getLendingPool(account) {
  const lendingPoolAddressProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );

  const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );

  return lendingPool;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
