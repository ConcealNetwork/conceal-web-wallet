#!/bin/bash
##################################################################################
# this file is subject to Licence
# Copyright (c) 2024, Acktarius
###################################################################################
#
# This is a dev tool to harmonize language json file, en.json being master
# exemple use:  ./harmoniz fr
# harmonized file would be Hfr.json ... up to you then to copy/paste it in fr.json
# ./harmoniz DH will remove all H*.json file
# ----------------->   NOTE: boolean value will become quoted   <------------------
###################################################################################

#functions
#trip
trip() {
kill -INT $$
}

messageOut() {
echo -e $1
sleep 1
exit
}

# Checks
#Check Sponge
if ! command -v sponge &> /dev/null; then
echo "sponge not install\nrun following command to install it\nsudo apt-get install -y moreutils"
sleep 2
trip
fi

# list available child
listChild=$(ls | grep .json | sed 's/.json//' | sed 's/en//')

# Check argument
if [[ $1 == "" ]] || [[ ${#1} -gt 2 ]]; then
messageOut "you need to enter language as a 2 character argument"
fi
# Check if master en.json is available in directory
if [[ ! -f en.json ]]; then
messageOut "en.json is missing"
fi
#Delete all H*.json
if [[ "$1" == "DH" ]]; then
rm -f H*.json
messageOut "deleting H*.json files"
fi
#list of language
if [[ $(echo $listChild | grep -c $1) -eq 0 ]]; then
messageOut "language not in folder\nhere is what's available: ${listChild}"
fi
# Confirm arg language is available
if [[ ! -f $1.json ]]; then
messageOut "${1}.json is missing"
fi

#Translate
translate() {
  sl=en
  tl=$1
  shift
  base_url="https://translate.googleapis.com/translate_a/single?client=gtx&sl=$sl&tl=$tl&dt=t&q="
  ua='Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0'
  qry=$( echo "$*" | sed -e "s/\ /+/g" )
  full_url=$base_url$qry
  translation=$(curl -sA "$ua" "$full_url")
  echo "$translation" | sed 's/","/\n/g' | sed -E 's/\[|\]|"//g' | head -1
}


#prelim
echo -e "Choose an option for missing field:\n\t_Google-translate (internet connection required) (G)\n\t_Keep original english and translate on your own (K)\n\t_Quit (G|K|Q)"	
read ans
case $ans in
    Google|G|g)
    ans=true
    ;;
    Keep|K|k)
    ans=false
    ;;
    Quit|Q|q)
    messageOut "nothing will be done"
    ;;
    *)
    messageOut "unknown request"
    ;;
esac

#translate if answer true, param $1=$1, $2:ans, $3:y
answer() {
if [[ "$2" == true ]]; then
    echo "translation will occur"
    y=$(translate $1 $3)
fi
}


#MAIN

cp en.json H$1.json

layerZero=$(jq 'keys_unsorted' en.json)
layerZero=($(echo $layerZero | sed -e 's/\[ //g' -e 's/\ ]//g' -e 's/\,//g' -e 's/\"//g'))

for i in ${layerZero[@]}; do
echo $i
layerOne=$(jq -r --arg VAR $i '.[$VAR] | keys_unsorted' en.json)
layerOne=($(echo $layerOne | sed -e 's/\[ //g' -e 's/\ ]//g' -e 's/\,//g' -e 's/\"//g'))

    for j in ${layerOne[@]}; do
    jq -r --arg VARI $i --arg VARJ $j '.[$VARI][$VARJ] | keys_unsorted' en.json &>/dev/null
    if [[ $? == 0 ]]; then
    layerTwo=$(jq -r --arg VARI $i --arg VARJ $j '.[$VARI][$VARJ] | keys_unsorted' en.json)
    layerTwo=($(echo $layerTwo | sed -e 's/\[ //g' -e 's/\ ]//g' -e 's/\,//g' -e 's/\"//g'))
    
        for k in ${layerTwo[@]}; do
        jq -r --arg VARI $i --arg VARJ $j --arg VARK $k '.[$VARI][$VARJ][$VARK] | keys_unsorted' en.json &>/dev/null
        if [[ $? == 0 ]]; then
        layerThree=$(jq -r --arg VARI $i --arg VARJ $j --arg VARK $k '.[$VARI][$VARJ][$VARK] | keys_unsorted' en.json)
        layerThree=($(echo $layerThree | sed -e 's/\[ //g' -e 's/\ ]//g' -e 's/\,//g' -e 's/\"//g'))

            for l in ${layerThree[@]}; do
            jq -r --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARL $l '.[$VARI][$VARJ][$VARK][$VARL] | keys_unsorted' en.json &>/dev/null
            if [[ $? == 0 ]]; then
            layerFour=$(jq -r --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARL $l '.[$VARI][$VARJ][$VARK][$VARL] | keys_unsorted' en.json)
            layerFour=($(echo $layerFour | sed -e 's/\[ //g' -e 's/\ ]//g' -e 's/\,//g' -e 's/\"//g'))

            
                for m in  ${layerFour[@]}; do

                    x=$(jq -r --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARL $l --arg VARM $m '.[$VARI][$VARJ][$VARK][$VARL][$VARM]' $1.json)
                    if [[ $x != "null" ]]; then
                    jq --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARL $l --arg VARM $m --arg VARX "$x" '.[$VARI][$VARJ][$VARK][$VARL][$VARM] |= ($VARX)' H$1.json | sponge H$1.json
                    else
                    y=$(jq -r --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARL $l --arg VARM $m '.[$VARI][$VARJ][$VARK][$VARL]' en.json)
                    answer $1 $ans $y
                    jq --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARL $l --arg VARM $m --arg VARY "$y" '.[$VARI][$VARJ][$VARK][$VARL][$VARM] |= ($VARY)' H$1.json | sponge H$1.json
                    fi

                done
            else
                x=$(jq -r --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARL $l '.[$VARI][$VARJ][$VARK][$VARL]' $1.json)
                if [[ $x != "null" ]]; then
                jq --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARL $l --arg VARX "$x" '.[$VARI][$VARJ][$VARK][$VARL] |= ($VARX)' H$1.json | sponge H$1.json
                else
                y=$(jq -r --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARL $l '.[$VARI][$VARJ][$VARK][$VARL]' en.json)
                answer $1 $ans $y
                jq --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARL $l --arg VARY "$y" '.[$VARI][$VARJ][$VARK][$VARL] |= ($VARY)' H$1.json | sponge H$1.json
                fi

            fi
            done
        else
            x=$(jq -r --arg VARI $i --arg VARJ $j --arg VARK $k '.[$VARI][$VARJ][$VARK]' $1.json)
            if [[ $x != "null" ]]; then
            jq --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARX "$x" '.[$VARI][$VARJ][$VARK] |= ($VARX)' H$1.json | sponge H$1.json
            else
            y=$(jq -r --arg VARI $i --arg VARJ $j --arg VARK $k '.[$VARI][$VARJ][$VARK]' en.json)
            answer $1 $ans $y
            jq --arg VARI $i --arg VARJ $j --arg VARK $k --arg VARY "$y" '.[$VARI][$VARJ][$VARK] |= ($VARY)' H$1.json | sponge H$1.json
            fi

        fi
        done
    else
        x=$(jq -r --arg VARI $i --arg VARJ $j '.[$VARI][$VARJ]' $1.json)
        if [[ $x != "null" ]]; then
        jq --arg VARI $i --arg VARJ $j --arg VARX "$x" '.[$VARI][$VARJ] |= ($VARX)' H$1.json | sponge H$1.json
        else
        y=$(jq -r --arg VARI $i --arg VARJ $j '.[$VARI][$VARJ]' en.json)
        answer $1 $ans $y
        jq --arg VARI $i --arg VARJ $j --arg VARY "$y" '.[$VARI][$VARJ] |= ($VARY)' H$1.json | sponge H$1.json
        fi
    fi
    done


done