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

  const handleSubmitButtonClick = () => {
    if (isNaN(suspect) || isNaN(weapon)) {
      return
    }
    setVisible(false)
    submitHandler(suspect, weapon)
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
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmitButtonClick}>
          Make {guessType}
        </Button>,
      ]}
    >
      <Form.Item label="Suspect">
        <Select
          onChange={(value) => { setSuspect(value) }}
          placeholder="Select the suspect">
          {[...playingCardsMap.keys()].filter((a) => 1 <= a && a <= 6).map((item, index) => (
            <Select.Option key={index} value={item}>{playingCardsMap?.get(item)?.name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Weapon">
        <Select
          onChange={(value) => { setWeapon(value) }}
          placeholder="Select the weapon">
          {[...playingCardsMap.keys()].filter((a) => 7 <= a && a <= 12).map((item, index) => (
            <Select.Option key={index} value={item}>{playingCardsMap?.get(item)?.name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Modal>
  </div>

  );
}
