import { Card, Avatar } from 'antd';
const { Meta } = Card;
import { FC } from 'react';

export interface IPlayingCardsProps {
  hand: Array<number>
}

const gridStyle: any = {
  width: '100%',
  minWidth: 200,
  maxWidth: 360,
  textAlign: 'center',
};


export interface PlayingCard {
  name: string,
  imageSrc: string,
}

export const playingCardsMap: Map<number, PlayingCard> = new Map([
  [0, { name: "INVALID", imageSrc: "" }],
  [1, { name: "Mr Mustard", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.I7kUHqfWOtSI4sIoTCRq9gHaFD%26pid%3DApi&f=1" }],
  [2, { name: "Ms Scarlet", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.wP7uBW8XlxGXKOtVfaa88AHaET%26pid%3DApi&f=1" }],
  [3, { name: "Ms Plum", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.BS1QVIVqUvTNS3MSYQqlwgHaFP%26pid%3DApi&f=1" }],
  [4, { name: "Mr Green", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.6TK8Aax57TW3FIFPvBc50wHaJS%26pid%3DApi&f=1" }],
  [5, { name: "Mr White", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.Xom5Jq08UyRHlcvtMNj9VQHaDj%26pid%3DApi&f=1" }],
  [6, { name: "Ms Peacock", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.JdhMTU5TG6b0DgsPW1UnywHaE6%26pid%3DApi&f=1" }],
  [7, { name: "Rope", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.KrJJXiJD1I7mqVr39GcXrAHaEK%26pid%3DApi&f=1" }],
  [8, { name: "Pipe", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.IduSvJxCIkchpgkwinsLjQHaMQ%26pid%3DApi&f=1" }],
  [9, { name: "Knife", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.ukzWPuvZWchSZPwqzLrIjQHaFj%26pid%3DApi&f=1" }],
  [10, { name: "Wrench", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.PivK1XeY6TatBcjNmlz8KQAAAA%26pid%3DApi&f=1" }],
  [11, { name: "Candlestick", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.8aulKmUjAJP5rtj0YdBpRQHaHa%26pid%3DApi&f=1" }],
  [12, { name: "Revolver", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.MmgIXfTfjRIJ-sHuN6CikAHaH6%26pid%3DApi&f=1" }],
  [13, { name: "Billard", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.GvvyKQATcl3KX-daHeltUwHaEN%26pid%3DApi&f=1" }],
  [14, { name: "Study", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.YIW8LuA49uLQIMfoxVjl3QHaC9%26pid%3DApi&f=1" }],
  [15, { name: "Hall", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.TQpZSTdhWg8qXeGu0ulV0wHaEK%26pid%3DApi&f=1" }],
  [16, { name: "Lounge", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.2DAvt61dU0_chgg5LvRdGAHaK1%26pid%3DApi&f=1" }],
  [17, { name: "Dining Room", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.fgKPXsYeZPnV3xUuXwpNFAHaE7%26pid%3DApi&f=1" }],
  [18, { name: "Ball Room", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.uO8IJLkARwMuxkFOHC_LQAHaFi%26pid%3DApi&f=1" }],
  [19, { name: "Conservatory", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.wGd084yXwV85dut3JtSVOAHaLG%26pid%3DApi&f=1" }],
  [20, { name: "Library", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.OJle_AKMONfoaSv61NSGqwHaE8%26pid%3DApi&f=1" }],
  [21, { name: "Kitchen", imageSrc: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.saqJJ-xD2PKd4_WCOD8wZAHaE5%26pid%3DApi&f=1" }],
])

function getPlayingCardsFromHand(hand: Array<number>): Array<PlayingCard | undefined> {
  return hand.map(cardId => { return playingCardsMap.get(cardId) })
}

export const PlayingCards: FC<IPlayingCardsProps> = ({ hand }) => {
  let playingCards: Array<PlayingCard | undefined> = getPlayingCardsFromHand(hand)

  return (
    <Card
      title="Playing Cards"
      headStyle={{ borderBottom: 'none' }}
      bodyStyle={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {playingCards.map((item, index) => (
        <Card.Grid
          key={index}
          style={gridStyle}
        >
          <Meta
            title={item?.name}
            description=""
            avatar={<Avatar src={item?.imageSrc} />}
          />
        </Card.Grid>
      ))}
    </Card>
  );
}
