import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import { execSync } from 'child_process';
import {expect} from "chai";
import {ethers} from "hardhat";
import fs from 'fs';



describe("SleepingBase", function () {
    // 生成tokenId和其属性的打包值
    function tokenIdGeneration(ages: string[]): bigint {
        const value1: bigint = BigInt(ages[0]); // 替换为正确的 tokenID
        const value2: bigint = BigInt(ages[1]); // 替换为正确的 token 稀有度
        const value3: bigint = BigInt(ages[2]); // 替换为正确的 token 心情值
        const value4: bigint = BigInt(ages[3]); // 替换为正确的 token 幸运值
        const value5: bigint = BigInt(ages[4]); // 替换为正确的 token 舒适度

        const shift192: bigint = value1 << 192n;
        const shift128: bigint = value2 << 128n;
        const shift96: bigint = value3 << 96n;
        const shift64: bigint = value4 << 64n;

        return shift192 | shift128 | shift96 | shift64 | value5
    }

    // 解析tokenId和其属性的打包值
    function tokenIdAnalysis(data: bigint): [bigint, bigint, bigint, bigint, bigint] {
        const tokenId: bigint = data >> 192n;
        const rarityValue: bigint = (data >> 128n) & ((1n << 64n) - 1n);
        const moodValue: bigint = (data >> 96n) & ((1n << 32n) - 1n);
        const luckyValue: bigint = (data >> 64n) & ((1n << 32n) - 1n);
        const comfortValue: bigint = data & ((1n << 64n) - 1n);

        return [tokenId, rarityValue, moodValue, luckyValue, comfortValue];
    }

    // 生成打开时间和交易时间的打包值
    function timeGeneration(aegs: string[]): bigint {
        const value1: bigint = BigInt(aegs[0]); // 替换为正确的 open 时间
        const value2: bigint = BigInt(aegs[1]); // 替换为正确的 sales 时间

        const shift128: bigint = value1 << 128n;

        return shift128 | value2
    }

    // 解析打开时间和交易时间的打包值
    function timeAnalysis(data: bigint): [bigint, bigint] {
        const openTime: bigint = BigInt(Number(data >> 128n));
        const salesTime: bigint = BigInt(Number(data));

        return [openTime, salesTime];
    }

    // 生成默克尔根到文件中
    function runGenerateMerkleRoot(): void {
        try {
            const command = 'ts-node scripts/generate-merkle-root.ts --input scripts/complex_example.json';
            const output = execSync(command, { encoding: 'utf8' });

            console.log(output);
        } catch (error) {
            console.error('Error executing command:', error);
        }
    }

    // 获取文件中的默克尔信息
    function readGenerateMerkleData(): any {
        try {
            const filePath = 'otherFiles/generateMerkle.json';
            const fileData = fs.readFileSync(filePath, { encoding: 'utf8' });
            const parsedData = JSON.parse(fileData);

            return parsedData;
        } catch (error) {
            console.error('Error reading generateMerkle.json:', error);
            return null;
        }
    }

    async function deploySleepingBase() {
        const [owner, otherAccount] = await ethers.getSigners();

        const SleepingBase = await ethers.getContractFactory("contracts/SleepingBase.sol:SleepingBase");
        const sleepingBase = await SleepingBase.deploy();

        return {sleepingBase, owner, otherAccount};
    }

    async function deploySleepingBaseBlindBox() {
        const [owner, otherAccount] = await ethers.getSigners();

        const SleepingBaseBlindBox = await ethers.getContractFactory("contracts/SleepingBaseBlindBox.sol:SleepingBaseBlindBox");

        runGenerateMerkleRoot();
        const {sleepingBase} = await loadFixture(deploySleepingBase);
        let time = Math.floor(Date.now() / 1000)
        let openAndSalesTime = timeGeneration([(time + 1000).toString(), (time + 2000).toString()]);
        let tokenUri = "{\"image\": \"ipfs://QmdrJ3qoFpAw6s6cxh3JNXyrURo3UopF6p5B2ma3ZB8kTc/FCB_MASTERPIECE2_STATIC.png\"}"


        const sleepingBaseBlindBox = await SleepingBaseBlindBox.deploy(
            sleepingBase.address,
            openAndSalesTime,
            tokenUri
        );

        return {sleepingBaseBlindBox, owner, otherAccount};
    }

     describe("检查类", function () {
        it("应该拥有正确的合约最高权限", async function () {
            let ss = readGenerateMerkleData();
            console.log(ss.merkleRoot)

        });
    //
    //     it("应该拥有正确的合约mint权限", async function () {
    //         const {sleepingBase, owner} = await loadFixture(deploySleepingBase);
    //         let MINTER_ROLE = await sleepingBase.MINTER_ROLE()
    //         expect(await sleepingBase.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    //     });
     });

    // describe("操作类", function () {
    //     describe("权限", function () {
    //         it("因该可以增加他人权限,他人相反", async function () {
    //             const {sleepingBase, otherAccount} = await loadFixture(deploySleepingBase);
    //
    //             let MINTER_ROLE = await sleepingBase.MINTER_ROLE()
    //
    //             await expect(sleepingBase.grantRole(MINTER_ROLE, otherAccount.address)).not.to.be.reverted
    //             await expect(sleepingBase.connect(otherAccount).grantRole(MINTER_ROLE, otherAccount.address)).to.be.reverted;
    //
    //         });
    //
    //         it("因该可以暂停开启,他人相反", async function () {
    //             const {sleepingBase, otherAccount} = await loadFixture(deploySleepingBase);
    //
    //             await expect(sleepingBase.pause()).not.to.be.reverted;
    //             await expect(sleepingBase.unpause()).not.to.be.reverted;
    //
    //             await expect(sleepingBase.connect(otherAccount).pause()).to.be.reverted;
    //             await expect(sleepingBase.connect(otherAccount).unpause()).to.be.reverted;
    //
    //         });
    //
    //         it("因该可以放弃权限", async function () {
    //             const {sleepingBase, owner} = await loadFixture(deploySleepingBase);
    //
    //             let DEFAULT_ADMIN_ROLE = await sleepingBase.DEFAULT_ADMIN_ROLE()
    //             let MINTER_ROLE = await sleepingBase.MINTER_ROLE()
    //
    //             await expect(sleepingBase.renounceRole(DEFAULT_ADMIN_ROLE, owner.address)).not.to.be.reverted;
    //             await expect(sleepingBase.renounceRole(MINTER_ROLE, owner.address)).not.to.be.reverted;
    //
    //         });
    //
    //         it("因该可以撤销他人权限,他人相反", async function () {
    //             const {sleepingBase, owner, otherAccount} = await loadFixture(deploySleepingBase);
    //
    //             let MINTER_ROLE = await sleepingBase.MINTER_ROLE()
    //             await sleepingBase.grantRole(MINTER_ROLE, otherAccount.address)
    //
    //             await expect(sleepingBase.revokeRole(MINTER_ROLE, otherAccount.address)).not.to.be.reverted;
    //             await expect(sleepingBase.connect(otherAccount).revokeRole(MINTER_ROLE, owner.address)).to.be.reverted;
    //
    //         });
    //
    //
    //         it("因该可以进行增发操作,他人相反", async function () {
    //             const {sleepingBase, owner, otherAccount} = await loadFixture(deploySleepingBase);
    //
    //             let combinedData = tokenIdGeneration()
    //
    //             await expect(sleepingBase.safeMint(owner.address, [combinedData], ["test"])).not.to.be.reverted;
    //             await expect(sleepingBase.connect(otherAccount).safeMint(owner.address, [combinedData], ["test"])).to.be.reverted;
    //
    //         });
    //
    //         it("因该可以进行销毁操作,他人相反", async function () {
    //             const {sleepingBase, owner, otherAccount} = await loadFixture(deploySleepingBase);
    //
    //             let combinedData = tokenIdGeneration()
    //             let [tokenId] = tokenIdAnalysis(combinedData);
    //
    //             await sleepingBase.safeMint(owner.address, [combinedData], ["test"])
    //
    //             await expect(sleepingBase.safeBurn(tokenId)).not.to.be.reverted;
    //             await expect(sleepingBase.connect(otherAccount).safeBurn(tokenId)).to.be.reverted;
    //
    //         });
    //
    //         it("因该可以进行URI修改,他人相反", async function () {
    //             const {sleepingBase, owner, otherAccount} = await loadFixture(deploySleepingBase);
    //
    //             let combinedData = tokenIdGeneration()
    //             let [tokenId] = tokenIdAnalysis(combinedData);
    //
    //             await sleepingBase.safeMint(owner.address, [combinedData], ["test"])
    //
    //             await expect(sleepingBase.steTokenUri(tokenId, "test1")).not.to.be.reverted;
    //             await expect(sleepingBase.connect(otherAccount).steTokenUri(tokenId, "test1")).to.be.reverted;
    //         });
    //     });
    //
    //
    //     describe("转账", function () {
    //         it("NFT拥有者应该可以转账", async function () {
    //             const {sleepingBase, owner, otherAccount} = await loadFixture(deploySleepingBase);
    //
    //             let combinedData = tokenIdGeneration();
    //             await sleepingBase.safeMint(owner.address, [combinedData], ["test"]);
    //
    //             let [tokenId] = tokenIdAnalysis(combinedData);
    //             await sleepingBase.setApprovalForAll(otherAccount.address, true);
    //
    //             await expect(sleepingBase.transferFrom(owner.address, otherAccount.address, tokenId)).not.to.be.reverted;
    //         });
    //
    //         it("NFT未拥有者不应该可以转账", async function () {
    //             const {sleepingBase, owner, otherAccount} = await loadFixture(deploySleepingBase);
    //
    //             let combinedData = tokenIdGeneration();
    //             let [tokenId] = tokenIdAnalysis(combinedData);
    //             await sleepingBase.connect(otherAccount).setApprovalForAll(owner.address, true);
    //
    //             await expect(sleepingBase.connect(otherAccount).transferFrom(otherAccount.address, owner.address, tokenId)).to.be.reverted;
    //         });
    //     });
    // });
});
