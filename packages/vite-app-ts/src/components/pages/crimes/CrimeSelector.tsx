import { Form, Select, Modal, Button } from 'antd';
import { FC, useState } from 'react';
import { playingCardsMap } from './PlayingCards';

export interface ICrimeSelectorProps {
    submitHandler: any,
    guessType: string
}

export const CrimeSelector: FC<ICrimeSelectorProps> = ({ submitHandler, guessType }) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [suspect, setSuspect] = useState<number>(NaN)
    const [weapon, setWeapon] = useState<number>(NaN)
    const [room, setRoom] = useState<number>(NaN)

    const handleSubmitButtonClick = () => {
        if (isNaN(suspect) || isNaN(weapon) || isNaN(room)) {
            return
        }
        setVisible(false)
        submitHandler(suspect, weapon, room)
    }

    return (<div>
        <Button onClick={() => setVisible(true)}>
            Make {guessType}
        </Button>
        <Modal
            visible={visible}
            title={"Make your " + guessType?.toLowerCase()}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            footer={[
                <Button key="back" onClick={() => setVisible(false)}>
                    Cancel {guessType}
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmitButtonClick}>
                    Make {guessType}
                </Button>,
            ]}
        >
            <Form.Item label="Suspect">
                <Select
                    onChange={(value) => { setSuspect(value) }}
                    placeholder="Please select a suspect">
                    {[...playingCardsMap.keys()].filter((a) => 1 <= a && a <= 6).map((item) => (
                        <Select.Option value={item}>{playingCardsMap?.get(item)?.name}</Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item label="Weapon">
                <Select
                    onChange={(value) => { setWeapon(value) }}
                    placeholder="Please select a weapon">
                    {[...playingCardsMap.keys()].filter((a) => 7 <= a && a <= 12).map((item) => (
                        <Select.Option value={item}>{playingCardsMap?.get(item)?.name}</Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item label="Room">
                <Select
                    onChange={(value) => { setRoom(value) }}
                    placeholder="Please select a room">
                    {[...playingCardsMap.keys()].filter((a) => 13 <= a && a <= 21).map((item) => (
                        <Select.Option value={item}>{playingCardsMap?.get(item)?.name}</Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Modal>
    </div>

    );
}
