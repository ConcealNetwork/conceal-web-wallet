import React from 'react';
import { Settings, Wallet, SwitchCamera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function MorePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 pb-24 pt-24 md:pt-32 relative z-10">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          <Button
            onClick={() => {}} 
            variant="outline"
            className="w-full justify-between"
          >
            Network Stats
            <Settings className="w-5 h-5" />
          </Button>

          <Accordion type="single" collapsible className="w-full bg-black/30 backdrop-blur-sm border border-[#ffa500] rounded-lg overflow-hidden">
            <AccordionItem value="donation" className="border-b-0">
              <AccordionTrigger>
                <div className="flex items-center justify-between flex-1">
                  <span>Make a Donation</span>
                  <Wallet className="w-5 h-5" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 text-white">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Conceal:</p>
                    <p className="text-sm break-all bg-black/20 p-2 rounded">
                      ccx7V4LeUXy2eZ9waDXgsLS7Uc11e2CpNSCWVdxEqSRFAm6P6NQhSb7XMG1D6VAZKmJeaJP37WYQg84zbNrPduTX2whZ5pacfj
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Monero:</p>
                    <p className="text-sm break-all bg-black/20 p-2 rounded">
                      41gW3g6qVxoTqRQAZwNpREfYntrmH31PvJLxKVfU7hGySukxB2YVMn3exzoEfV6pAy2GzubVKZpTrRfYJnMCrjG421e8WbY
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            onClick={() => {}} 
            variant="outline"
            className="w-full justify-between"
          >
            Switch Wallet
            <SwitchCamera className="w-5 h-5" />
          </Button>

          <Button
            onClick={() => navigate('/')} 
            variant="destructive"
            className="w-full justify-between"
          >
            Disconnect Wallet
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}