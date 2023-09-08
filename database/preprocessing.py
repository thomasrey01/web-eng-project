import pandas as pd
import json
import argparse

if __name__ == "__main__":
	parser = argparse.ArgumentParser(description='Preprocess the data')
	parser.add_argument('--input', type=str, help='Input file', required=True)
	parser.add_argument('--output', type=str, help='Output file', default="properties_cleaned.json")
	args = parser.parse_args()

	df = pd.read_json(args.input, lines=True)
	df.drop(['postedAgo', '_id', 'datesPublished', 'crawlStatus', 'detailsCrawledAt', 'firstSeenAt', 'lastSeenAt', 'crawledAt', 'areaRaw', 'rentRaw', 'additionalCostsRaw', 'depositRaw', 'descriptionNonTranslatedRaw', 'descriptionTranslatedRaw', 'registrationCostRaw', 'matchAgeBackup', 'userDisplayName', 'userId', 'userLastLoggedOn', 'userMemberSince', 'userPhotoUrl', 'matchGenderBackup', 'matchStatusBackup', 'descriptionNonTranslated'], axis=1, inplace=True)

	df = df.where(pd.notnull(df), None)

	df["isRoomActive"] = df["isRoomActive"].astype(bool)
	df.rename(columns={"title": "street"}, inplace=True)

	rent = df["rent"]
	areaSqm = df["areaSqm"]
	rentSqm = [round(a / b, 2) for a, b in zip(rent, areaSqm)]

	df["rentSqm"] = rentSqm


	with open('properties_cleaned.json', 'w') as f:
		i = 0
		for y in df.to_dict(orient='records'):
			tmp = json.dumps(y)
			tmp = tmp.replace("NaN", "null")
			f.write(tmp + '\n')

