import React, { useEffect, useState } from "react";
import { Card, Input, Typography } from "@material-tailwind/react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useChainId,
  useWaitForTransaction,
} from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { useAccount } from "wagmi";
import Notification from "./Notification";

import { getSubscriptionPrice } from "@/lib/tableland";
import { getPrice } from "@/lib/contractReads";
type DynamicFormModalProps = {
  schemaUID?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (schemaData: any) => void; // Replace 'any' with the actual type of your event data
};

const SubscriptionForm: React.FC<DynamicFormModalProps> = ({
  schemaUID,
  isOpen,
  onClose,
  onCreate,
}) => {
  const chainID = useChainId();
  const [months, setMonths] = useState(1);
  const [price, setPrice] = useState(0);
  const [visiblePrice, setVisiblePrice] = useState("0");
  const [open, setOpen] = useState(isOpen);

  const { config, error } = usePrepareContractWrite({
    // @ts-ignore
    address: CONTRACTS.SubscriptionResolver[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.SubscriptionResolver[chainID].abi,
    functionName: "subscribe",
    args: [schemaUID, months],
    value: BigInt(price * months),
  });
  const { write, data, isLoading, isSuccess, isError } =
    useContractWrite(config);

  const {
    data: res,
    isError: err,
    isLoading: wait,
    isSuccess: succ,
  } = useWaitForTransaction({
    confirmations: 2,
    hash: data?.hash,
  });

  const { address } = useAccount();

  useEffect(() => {
    const fetch = async () => {
      let res = await getSubscriptionPrice(chainID, schemaUID);
      setPrice(Number(getPrice(res)));
      setVisiblePrice(getPrice(res));
    };
    fetch();
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 ${
        open ? "block" : "hidden"
      }`}
    >
      <Card
        color="white"
        shadow={false}
        className="mb-4 p-4 border border-black rounded-xl flex flex-col items-center mx-auto"
      >
        <Typography color="gray" className="mt-1 font-normal">
          Subscribe to get Access.
        </Typography>
        <Typography color="gray" className="mt-1 font-normal">
          {`Price per month: ${price/ 10 ** 18}`}
        </Typography>
        <Typography color="gray" className="mt-1 font-normal">
          {`total : ${(price / 10 ** 18) * months} ethers for ${months} months`}
        </Typography>
        <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96 flex flex-col items-center mx-auto">
          <div className="mb-4 flex flex-col items-center mx-auto gap-6">
            <label className="mt-1 font-normal">Months</label>
            <Input
              type="number"
              size="lg"
              placeholder="Subscribe for x months"
              name={"Months"}
              value={months}
              min={1}
              // @ts-ignore
              onChange={(e) => setMonths(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={write}
              className="bg-black text-white rounded-md px-6 py-2 hover:bg-white hover:text-black border border-black"
            >
              Subscribe
            </button>
            <button
              type="button"
              className="bg-black text-white rounded-md px-6 py-2 hover:bg-white hover:text-black border border-black"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
          <Notification
            isLoading={isLoading}
            isSuccess={isSuccess}
            isError={
              error?.message
                ? error.message.indexOf(".") !== -1
                  ? error.message.substring(0, error.message.indexOf("."))
                  : error.message
                : undefined
            }
            wait={wait}
            error={err}
            success={succ ? "You Subscribed successfully" : undefined}
          />
        </form>
      </Card>
    </div>
  );
};

export default SubscriptionForm;
